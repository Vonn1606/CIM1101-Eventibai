"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/* --------------------------------------------------------------------------
   submitEvent – inserts a new event into the events table for SAO review
   -------------------------------------------------------------------------- */

const submitEventSchema = z.object({
  title: z.string().min(2, "Event title is required"),
  venue: z.string().optional(),
  venueId: z.string().optional(),
  organizationId: z.string().optional(),
  collegeId: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacity: z.coerce.number().min(1).max(10000),
  tier: z.string().optional(),
  memo: z.string().optional(),
});

export type SubmitEventInput = z.infer<typeof submitEventSchema>;
export type SubmitEventResult = { error?: string; eventId?: string };

export async function submitEvent(
  input: SubmitEventInput
): Promise<SubmitEventResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "You must be signed in." };

  const parsed = submitEventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    title,
    venue,
    venueId: inputVenueId,
    organizationId: inputOrgId,
    collegeId,
    category,
    description,
    date,
    startTime,
    endTime,
    capacity,
    memo,
  } = parsed.data;

  // Verify or resolve the organiser's organisation on the server
  let orgId = inputOrgId;
  if (orgId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: verifiedMember } = await (supabase as any)
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!verifiedMember) {
      return { error: "You are not an authorized member of the selected organization." };
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberData } = await (supabase as any)
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!memberData)
      return { error: "You are not affiliated with any organisation." };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orgId = (memberData as any).organization_id as string;
  }

  // Resolve venue
  let venueId: string | null = inputVenueId ?? null;
  if (!venueId && venue) {
    const { data: venueRow } = (await supabase
      .from("venues")
      .select("id")
      .ilike("name", `%${venue}%`)
      .limit(1)
      .single()) as { data: { id: string } | null };

    venueId = venueRow?.id ?? null;
  }

  // Parse dates with explicit Manila offset (+08:00) so server timezone does not shift event times
  let startsAt: string;
  let endsAt: string | null = null;
  try {
    const timeZoneSuffix = "+08:00";
    const startTimeFormatted = startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : "09:00:00";
    startsAt = new Date(`${date}T${startTimeFormatted}${timeZoneSuffix}`).toISOString();

    if (endTime) {
      const endTimeFormatted = endTime.length === 5 ? `${endTime}:00` : endTime;
      endsAt = new Date(`${date}T${endTimeFormatted}${timeZoneSuffix}`).toISOString();
    }
  } catch {
    return { error: "Invalid date or time entered. Please enter a valid date." };
  }

  // Slug: title → lowercase, spaces to dashes, keep alphanumeric
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) +
    "-" +
    Date.now().toString(36);

  const descText = description || memo || "";
  const descArray = descText ? [descText] : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: insertData, error: insertError } = await (supabase as any)
    .from("events")
    .insert({
      title,
      slug,
      organization_id: orgId,
      college_id: collegeId ?? null,
      venue_id: venueId,
      starts_at: startsAt,
      ends_at: endsAt,
      total_capacity: capacity,
      category: category ?? "General",
      approval: "pending",
      status: "draft",
      description: descArray,
      summary: descText ? descText.slice(0, 160) : "",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newEventId = (insertData as any).id;

  // Insert into event_approvals queue for admin review (schema column is decision_note)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: approvalInsertError } = await (supabase as any)
    .from("event_approvals")
    .insert({
      event_id: newEventId,
      submitted_by: user.id,
      brief: descText || null,
      seats_expected: capacity,
      stage: "Awaiting Review",
      decision_note: memo ?? null,
    });

  if (approvalInsertError) {
    // If approval queue insert fails, do not silently swallow; report error
    return { error: `Event created but approval submission failed: ${approvalInsertError.message}`, eventId: newEventId };
  }

  revalidatePath("/organizer-dashboard");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");

  return { eventId: newEventId };
}

/* --------------------------------------------------------------------------
   toggleCheckIn – upserts / deletes a check_ins row
   -------------------------------------------------------------------------- */

export type CheckInResult = { error?: string; checkedIn?: boolean; checkedInTime?: string };

export async function toggleCheckIn(
  registrationId: string,
  currentlyCheckedIn: boolean
): Promise<CheckInResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  if (!z.string().uuid().safeParse(registrationId).success) {
    return { error: "Invalid registration ID." };
  }

  // Resolve the event first: needed for the ownership check and because
  // check_ins requires a non-null event_id.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: regRow, error: regErr } = await (supabase as any)
    .from("registrations")
    .select("event_id")
    .eq("id", registrationId)
    .single();

  if (regErr || !regRow) {
    return { error: regErr?.message ?? "Registration record not found." };
  }
  const eventId = (regRow as { event_id: string }).event_id;

  // Item 1: only the event's owner (creator, org member or admin) may check in.
  // RLS ("owners manage check-ins") enforces this too; this gives a clear error.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: owns, error: ownsErr } = await (supabase.rpc as any)(
    "user_owns_event",
    { p_event: eventId }
  );
  if (ownsErr) return { error: ownsErr.message };
  if (!owns) {
    return { error: "You do not have permission to manage check-ins for this event." };
  }

  if (currentlyCheckedIn) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("check_ins")
      .delete()
      .eq("registration_id", registrationId);
    if (error) return { error: error.message };
    revalidatePath("/organizer-dashboard");
    return { checkedIn: false };
  }

  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("check_ins")
    .upsert(
      {
        registration_id: registrationId,
        event_id: eventId,
        checked_in_by: user.id,
        checked_in_at: now,
      },
      { onConflict: "registration_id" }
    );
  if (error) return { error: error.message };
  revalidatePath("/organizer-dashboard");
  return {
    checkedIn: true,
    checkedInTime: new Date(now).toLocaleTimeString("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/* --------------------------------------------------------------------------
   updateEvent – updates draft or returned events, allowing resubmission for review
   -------------------------------------------------------------------------- */

const updateEventSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  title: z.string().min(2, "Event title is required").optional(),
  venueId: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacity: z.coerce.number().min(1).max(10000).optional(),
  resubmitForReview: z.boolean().optional(),
  resubmitMemo: z.string().optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type UpdateEventResult = { error?: string; success?: boolean };

export async function updateEvent(
  input: UpdateEventInput
): Promise<UpdateEventResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "You must be signed in." };

  const parsed = updateEventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    eventId,
    title,
    venueId,
    category,
    description,
    date,
    startTime,
    endTime,
    capacity,
    resubmitForReview,
    resubmitMemo,
  } = parsed.data;

  // Verify ownership / permissions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingEvent, error: fetchErr } = await (supabase as any)
    .from("events")
    .select("id, created_by, approval, status")
    .eq("id", eventId)
    .single();

  if (fetchErr || !existingEvent) return { error: "Event not found." };
  if (existingEvent.created_by !== user.id) {
    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((profile as any)?.role !== "admin") {
      return { error: "You do not have permission to update this event." };
    }
  }

  // Update object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {};
  if (title) updates.title = title;
  if (venueId) updates.venue_id = venueId;
  if (category) updates.category = category;
  if (capacity) updates.total_capacity = capacity;
  if (description) {
    updates.description = description.split("\n\n").map((p) => p.trim()).filter(Boolean);
    updates.summary = description.slice(0, 160);
  }

  if (date) {
    try {
      const timeZoneSuffix = "+08:00";
      const startTimeFormatted = startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : "09:00:00";
      updates.starts_at = new Date(`${date}T${startTimeFormatted}${timeZoneSuffix}`).toISOString();
      if (endTime) {
        const endTimeFormatted = endTime.length === 5 ? `${endTime}:00` : endTime;
        updates.ends_at = new Date(`${date}T${endTimeFormatted}${timeZoneSuffix}`).toISOString();
      }
    } catch {
      return { error: "Invalid date or time provided." };
    }
  }

  if (resubmitForReview) {
    updates.approval = "pending";
    updates.status = "draft";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabase as any)
    .from("events")
    .update(updates)
    .eq("id", eventId);

  if (updateErr) return { error: updateErr.message };

  if (resubmitForReview) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("event_approvals").insert({
      event_id: eventId,
      submitted_by: user.id,
      brief: updates.summary ?? null,
      seats_expected: updates.total_capacity ?? null,
      stage: "Awaiting Review",
      decision: "pending",
      decision_note: resubmitMemo ?? "Resubmitted after edits",
    });
  }

  revalidatePath("/organizer-dashboard");
  revalidatePath("/admin/approvals");
  revalidatePath(`/events/${eventId}`);

  return { success: true };
}

