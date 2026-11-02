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

  const { eventId, studentNumber, college } = parsed.data;

  // 3. Get college_id from slug
  const { data: collegeRow } = await supabase
    .from("colleges")
    .select("id")
    .eq("slug", college)
    .single();

  if (!collegeRow) return { error: "Invalid college selected." };
  const collegeId = (collegeRow as { id: string }).id;

  // 4. Call the RPC (handles seat counting + waitlist)
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "register_for_event" as never,
    {
      p_event_id: eventId,
      p_user_id: user.id,
      p_student_number: studentNumber,
      p_college_id: collegeId,
    } as never
  );

  if (rpcError) {
    if (rpcError.message.includes("already registered"))
      return { error: "You are already registered for this event." };
    return { error: rpcError.message };
  }

  const rows = (rpcData as unknown) as Array<{ ticket_code: string; status: string }> | null;
  const result = rows?.[0];
  if (!result) return { error: "Registration failed. Please try again." };

  // 5. Revalidate
  revalidatePath("/my-events");

  return {
    ticketCode: result.ticket_code,
    status: result.status as "registered" | "waitlisted",
  };
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
      has_checked_in: Array.isArray(row.check_ins) && row.check_ins.length > 0,
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
