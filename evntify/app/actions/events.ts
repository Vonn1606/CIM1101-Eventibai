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

  // Resolve the organiser's organisation
  let orgId = inputOrgId;
  if (!orgId) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: venueRow } = await (supabase as any)
      .from("venues")
      .select("id")
      .ilike("name", `%${venue}%`)
      .limit(1)
      .single();

    venueId = venueRow ? (venueRow as any).id : null;
  }

  // Parse dates
  let startsAt: string;
  let endsAt: string | null = null;
  try {
    startsAt = startTime
      ? new Date(`${date}T${startTime}:00`).toISOString()
      : new Date(date).toISOString();
    if (endTime) {
      endsAt = new Date(`${date}T${endTime}:00`).toISOString();
    }
  } catch {
    startsAt = new Date().toISOString();
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

  // Insert into event_approvals queue for admin review
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("event_approvals")
    .insert({
      event_id: newEventId,
      submitted_by: user.id,
      brief: descText || null,
      seats_expected: capacity,
      stage: "Awaiting Review",
      notes: memo ?? null,
    });

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

  if (currentlyCheckedIn) {
    // Remove check-in
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("check_ins")
      .delete()
      .eq("registration_id", registrationId);
    if (error) return { error: error.message };
    revalidatePath("/organizer-dashboard");
    return { checkedIn: false };
  } else {
    // Upsert check-in
    const now = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("check_ins")
      .upsert(
        { registration_id: registrationId, checked_in_by: user.id, checked_in_at: now },
        { onConflict: "registration_id" }
      );
    if (error) return { error: error.message };
    revalidatePath("/organizer-dashboard");
    return {
      checkedIn: true,
      checkedInTime: new Date(now).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }
}

