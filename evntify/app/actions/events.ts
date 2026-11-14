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
    const { data: verifiedMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!verifiedMember) {
      // Check if user is an admin or creator
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return { error: "You are not an authorized member of the selected organization." };
      }
    }
  } else {
    const { data: memberData } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (memberData) {
      orgId = memberData.organization_id;
    } else {
      // Check if user is an admin or if an organization can be provisioned
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin" || profile?.role === "organizer") {
        // Fallback to first available organization in campus
        const { data: defaultOrg } = await supabase
          .from("organizations")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (defaultOrg) {
          orgId = defaultOrg.id;
          // Associate the organizer so subsequent checks succeed
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("organization_members").upsert(
            { organization_id: orgId, user_id: user.id, position: "Lead Organizer" },
            { onConflict: "organization_id,user_id" }
          );
        } else {
          return { error: "No organization found on campus. Please contact Student Affairs." };
        }
      } else {
        return {
          error:
            "You are not affiliated with any recognized organization yet. Please submit an application under 'Apply as Organizer' in your profile to obtain approval.",
        };
      }
    }
  }

  // Resolve venue
  let venueId: string | null = inputVenueId ?? null;
  if (!venueId && venue) {
    const { data: venueRow } = (await supabase
      .from("venues")
      .select("id")
      .ilike("name", `%${venue}%`)
      .limit(1)
      .maybeSingle()) as { data: { id: string } | null };

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

  // Map tier to database enum access_tier
  const tierKey = (parsed.data.tier ?? "").trim().toLowerCase();
  const dbTier: "free_rsvp" | "tiered_rsvp" | "ticketed" | "vip_only" =
    tierKey === "vip only" || tierKey === "vip_only"
      ? "vip_only"
      : tierKey === "ticketed"
        ? "ticketed"
        : tierKey === "tiered rsvp" || tierKey === "tiered_rsvp"
          ? "tiered_rsvp"
          : "free_rsvp";

  const { data: insertData, error: insertError } = await supabase
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
      tier: dbTier,
      approval: "pending",
      status: "draft",
      description: descArray,
      summary: descText ? descText.slice(0, 160) : "",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };

  const newEventId = insertData.id;

  // Insert into event_approvals queue for admin review (schema column is decision_note)
  const { error: approvalInsertError } = await supabase
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
  const { data: regRow, error: regErr } = await supabase
    .from("registrations")
    .select("event_id")
    .eq("id", registrationId)
    .single();

  if (regErr || !regRow) {
    return { error: regErr?.message ?? "Registration record not found." };
  }
  const eventId = regRow.event_id;

  // Only the event's owner (creator, org member or admin) may check in.
  const { data: owns, error: ownsErr } = await supabase.rpc(
    "user_owns_event",
    { p_event: eventId }
  );
  if (ownsErr) return { error: ownsErr.message };
  if (!owns) {
    return { error: "You do not have permission to manage check-ins for this event." };
  }

  if (currentlyCheckedIn) {
    const { error } = await supabase
      .from("check_ins")
      .delete()
      .eq("registration_id", registrationId);
    if (error) return { error: error.message };
    revalidatePath("/organizer-dashboard");
    return { checkedIn: false };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
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

  // Verify ownership / permissions (creator, organization member, or admin)
  const { data: owns, error: ownsErr } = await supabase.rpc("user_owns_event", {
    p_event: eventId,
  });
  if (ownsErr || !owns) {
    return { error: "You do not have permission to update this event." };
  }

  const { data: existingEvent, error: fetchErr } = await supabase
    .from("events")
    .select("id, slug, approval, status")
    .eq("id", eventId)
    .single();

  if (fetchErr || !existingEvent) return { error: "Event not found." };

  // Block edits to approved, ongoing, or completed events
  if (
    existingEvent.approval === "approved" ||
    existingEvent.status === "ongoing" ||
    existingEvent.status === "completed"
  ) {
    return {
      error: "Approved, ongoing, or completed events cannot be edited directly.",
    };
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

  const { error: updateErr } = await supabase
    .from("events")
    .update(updates)
    .eq("id", eventId);

  if (updateErr) return { error: updateErr.message };

  if (resubmitForReview) {
    const { error: apErr } = await supabase.from("event_approvals").insert({
      event_id: eventId,
      submitted_by: user.id,
      brief: updates.summary ?? null,
      seats_expected: updates.total_capacity ?? null,
      stage: "Awaiting Review",
      decision: "pending",
      decision_note: resubmitMemo ?? "Resubmitted after edits",
    });

    if (apErr) {
      return {
        error: `Event details saved, but resubmission for review failed: ${apErr.message}`,
      };
    }
  }

  revalidatePath("/organizer-dashboard");
  revalidatePath("/admin/approvals");
  revalidatePath(`/events/${existingEvent.slug}`);

  return { success: true };
}

