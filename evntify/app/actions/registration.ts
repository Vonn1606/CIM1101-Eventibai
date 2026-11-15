"use server";

import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type RegistrationResult = {
  error?: string;
  ticketCode?: string;
  status?: "registered" | "waitlisted";
};

export async function registerForEvent(
  input: z.infer<typeof registerSchema>
): Promise<RegistrationResult> {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "You must be signed in to register." };

  // 2. Validate input
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { eventId: inputEventId, studentNumber, college } = parsed.data;

  // Resolve UUID if inputEventId is a slug or a UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inputEventId);

  // Use separate queries instead of interpolating user input into .or() (filter injection risk)
  let ev: { id: string; slug: string; registration_deadline: string | null; status: string; starts_at: string | null } | null = null;
  if (isUuid) {
    const { data } = await supabase
      .from("events")
      .select("id, slug, registration_deadline, status, starts_at")
      .eq("id", inputEventId)
      .maybeSingle();
    ev = data ?? null;
  }
  // If not found by UUID (or it's a slug), try slug lookup
  if (!ev) {
    // Sanitize slug: allow only alphanumeric and dashes to prevent injection
    const safeSlug = inputEventId.replace(/[^a-z0-9-]/gi, "");
    const { data } = await supabase
      .from("events")
      .select("id, slug, registration_deadline, status, starts_at")
      .eq("slug", safeSlug)
      .maybeSingle();
    ev = data ?? null;
  }

  if (!ev) return { error: "Event not found." };
  const eventId = ev.id;

  // Suspended, cancelled, or completed events cannot take registrations
  if (ev.status === "suspended") {
    return { error: "This event has been suspended and is not accepting registrations." };
  }
  if (ev.status === "cancelled") {
    return { error: "This event has been cancelled and is not accepting registrations." };
  }
  if (ev.status === "completed") {
    return { error: "This event has concluded and is no longer accepting registrations." };
  }

  const nowMs = Date.now();
  if (ev.starts_at && new Date(ev.starts_at).getTime() <= nowMs) {
    return { error: "Registration is closed because the event is ongoing or has passed." };
  }

  if (
    ev?.registration_deadline &&
    new Date(ev.registration_deadline).getTime() < nowMs
  ) {
    return { error: "Registration for this event has closed." };
  }

  // 3. Verify college exists
  const { data: collegeRow } = await supabase
    .from("colleges")
    .select("id")
    .eq("slug", college)
    .single();

  if (!collegeRow) return { error: "Invalid college selected." };

  // 4. Call the RPC (matches postgres signature: p_event, p_student_number, p_college)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
    "register_for_event",
    {
      p_event: eventId,
      p_student_number: studentNumber,
      p_college: college,
    }
  );

  if (rpcError) {
    const msg = rpcError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("duplicate key") || msg.includes("unique")) {
      return { error: "You are already registered for this event." };
    }
    if (msg.includes("not available")) {
      return { error: "Registration is not available for this event." };
    }
    return { error: rpcError.message };
  }

  // The postgres function returns a single registrations record (row or array depending on client)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!result || !result.ticket_code) return { error: "Registration failed. Please try again." };

  // 5. Revalidate
  revalidatePath("/my-events");
  revalidatePath(`/events/${ev?.slug ?? eventId}`);

  return {
    ticketCode: result.ticket_code,
    status: result.status as "registered" | "waitlisted",
  };
}

/* --------------------------------------------------------------------------
   cancelRegistration – lets a student cancel their own registration
   -------------------------------------------------------------------------- */
export async function cancelRegistration(
  registrationId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "You must be signed in." };

  // 2. Verify ownership — only the registrant can cancel their own registration
  const { data: reg, error: fetchErr } = await supabase
    .from("registrations")
    .select("id, user_id, status, events ( slug )")
    .eq("id", registrationId)
    .maybeSingle();

  if (fetchErr || !reg) return { error: "Registration not found." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const regRow = reg as any;
  if (regRow.user_id !== user.id) return { error: "You can only cancel your own registration." };
  if (regRow.status === "cancelled") return { error: "Registration is already cancelled." };

  // 3. Update status to cancelled (RLS allows users to update their own registrations)
  const { error: updateErr } = await supabase
    .from("registrations")
    .update({ status: "cancelled" })
    .eq("id", registrationId)
    .eq("user_id", user.id);

  if (updateErr) return { error: updateErr.message };

  // 4. Revalidate
  revalidatePath("/my-events");
  const slug = regRow.events?.slug;
  if (slug) revalidatePath(`/events/${slug}`);

  return {};
}

// ─── Shape types used by EventCards & my-events page ────────────────────────

export type UpcomingEvent = {
  id: string;
  headerLabel: string;
  headerColor: string;
  featured?: boolean;
  date: string;
  title: string;
  description: string;
  qrCode: string;
  venue: string;
  meta: string;
};

export type PastEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  venue: string;
  meta: string;
  status: "attended" | "missed" | "closed";
  footer: string;
};

// ─── DB row types ────────────────────────────────────────────────────────────

export type MyRegistration = {
  id: string;
  ticket_code: string;
  status: "registered" | "waitlisted" | "cancelled";
  registered_at: string;
  event: {
    id: string;
    slug: string;
    title: string;
    starts_at: string | null;
    venue: string;
    category: string | null;
  };
  has_checked_in: boolean;
};

type DbRegistrationRow = {
  id: string;
  ticket_code: string;
  status: string;
  registered_at: string;
  events: {
    id: string;
    slug: string;
    title: string;
    starts_at: string | null;
    category: string | null;
    venues: { name: string } | null;
  } | null;
  check_ins: Array<{ id: string }> | null;
};

export async function getMyRegistrations(userId: string): Promise<{
  upcoming: MyRegistration[];
  past: MyRegistration[];
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("registrations")
    .select(`
      id, ticket_code, status, registered_at,
      events ( id, slug, title, starts_at, category, venues ( name ) ),
      check_ins ( id )
    `)
    .eq("user_id", userId)
    .neq("status", "cancelled")
    .order("registered_at", { ascending: false });

  if (error || !data) return { upcoming: [], past: [] };

  const now = new Date();
  const rows = (data as unknown) as DbRegistrationRow[];

  const mapped: MyRegistration[] = rows.map((row) => {
    const ev = row.events;
    return {
      id: row.id,
      ticket_code: row.ticket_code,
      status: row.status as "registered" | "waitlisted" | "cancelled",
      registered_at: row.registered_at,
      event: {
        id: ev?.slug ?? "",
        slug: ev?.slug ?? "",
        title: ev?.title ?? "",
        starts_at: ev?.starts_at ?? null,
        venue: ev?.venues?.name ?? "",
        category: ev?.category ?? null,
      },
      has_checked_in: !!(Array.isArray(row.check_ins) ? row.check_ins[0] : row.check_ins),
    };
  });

  const upcoming = mapped.filter(
    (r) => !r.event.starts_at || new Date(r.event.starts_at) >= now
  );
  const past = mapped.filter(
    (r) => r.event.starts_at && new Date(r.event.starts_at) < now
  );

  return { upcoming, past };
}
