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
  venueId: z.string().uuid("Invalid venue ID").optional().or(z.literal("")),
  organizationId: z.string().uuid("Invalid organization ID").optional().or(z.literal("")),
  collegeId: z.string().uuid("Invalid college ID").optional().or(z.literal("")),
  category: z.enum([
    "Seminar",
    "Workshop",
    "Competition",
    "Symposium",
    "Social",
    "General",
  ]).optional().default("General"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(10000),
  tier: z.string().optional(),
  memo: z.string().optional(),
  registrationDeadline: z.string().optional(),
  qrEnabled: z.boolean().optional(),
  doorsOpenNote: z.string().optional(),
  coordinatorName: z.string().optional(),
  coordinatorEmail: z.string().email("Invalid coordinator email").optional().or(z.literal("")),
  coordinatorPhone: z.string().optional(),
  bannerColor: z.string().optional(),
});

export type SubmitEventInput = z.infer<typeof submitEventSchema>;
export type SubmitEventResult = { error?: string; eventId?: string };

export async function checkVenueAvailability(
  venueId: string,
  startsAt: string,
  endsAt: string,
  excludeEventId?: string
): Promise<{ available: boolean; conflictReason?: string }> {
  const supabase = await createClient();

  // Try RPC first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conflicts, error: rpcErr } = await (supabase.rpc as any)("check_venue_conflict", {
    p_venue_id: venueId,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_exclude_event_id: excludeEventId ?? null,
  });

  if (!rpcErr && Array.isArray(conflicts) && conflicts.length > 0) {
    const first = conflicts[0];
    return {
      available: false,
      conflictReason:
        first.conflict_type === "closure"
          ? `Venue is closed for: ${first.conflict_title}`
          : `Venue is already booked for "${first.conflict_title}" at that time.`,
    };
  }

  // Fallback direct check if RPC is not present
  if (rpcErr) {
    const { data: existingEvents } = await supabase
      .from("events")
      .select("id, title, starts_at, ends_at")
      .eq("venue_id", venueId)
      .in("status", ["open", "scheduled", "ongoing"]);

    if (existingEvents) {
      const startMs = new Date(startsAt).getTime();
      const endMs = new Date(endsAt).getTime();

      for (const ev of existingEvents) {
        if (excludeEventId && ev.id === excludeEventId) continue;
        const evStartMs = new Date(ev.starts_at).getTime();
        const evEndMs = ev.ends_at
          ? new Date(ev.ends_at).getTime()
          : evStartMs + 2 * 60 * 60 * 1000;

        if (startMs < evEndMs && endMs > evStartMs) {
          return {
            available: false,
            conflictReason: `Venue is already booked for "${ev.title}" during the selected time.`,
          };
        }
      }
    }
  }

  return { available: true };
}

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
    registrationDeadline,
    qrEnabled,
    doorsOpenNote,
    coordinatorName,
    coordinatorEmail,
    coordinatorPhone,
    bannerColor,
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
      // Check if user is an admin
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
      // Check if admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        const { data: defaultOrg } = await supabase
          .from("organizations")
          .select("id")
          .limit(1)
          .maybeSingle();
        if (defaultOrg) {
          orgId = defaultOrg.id;
        } else {
          return { error: "No campus organization found." };
        }
      } else {
        return {
          error:
            "You are not affiliated with any recognized student organization. Please submit an application under 'Apply as Organizer' to receive approval from Student Affairs.",
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
  let regDeadlineIso: string | null = null;
  try {
    const timeZoneSuffix = "+08:00";
    const startTimeFormatted = startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : "09:00:00";
    startsAt = new Date(`${date}T${startTimeFormatted}${timeZoneSuffix}`).toISOString();

    if (endTime) {
      const endTimeFormatted = endTime.length === 5 ? `${endTime}:00` : endTime;
      endsAt = new Date(`${date}T${endTimeFormatted}${timeZoneSuffix}`).toISOString();

      if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
        return { error: "Event end time must be after the start time." };
      }
    }

    const nowManilaTime = new Date().getTime();
    if (new Date(startsAt).getTime() <= nowManilaTime) {
      return { error: "Event start date/time must be in the future." };
    }

    if (registrationDeadline) {
      const deadlineDateFormatted = registrationDeadline.includes("T")
        ? registrationDeadline
        : `${registrationDeadline}T23:59:59`;
      regDeadlineIso = new Date(`${deadlineDateFormatted}${deadlineDateFormatted.includes("+") ? "" : timeZoneSuffix}`).toISOString();

      if (new Date(regDeadlineIso).getTime() >= new Date(startsAt).getTime()) {
        return { error: "Registration deadline must be before the event start time." };
      }
    }
  } catch {
    return { error: "Invalid date or time entered. Please enter a valid date." };
  }

  // Check venue capacity and availability if venueId is selected
  if (venueId) {
    const { data: venueRow } = await supabase
      .from("venues")
      .select("id, name, capacity")
      .eq("id", venueId)
      .maybeSingle();

    if (!venueRow) {
      return { error: "Selected venue was not found." };
    }

    if (capacity > venueRow.capacity) {
      return {
        error: `Target capacity (${capacity}) exceeds maximum seating for ${venueRow.name} (${venueRow.capacity} seats).`,
      };
    }

    const effectiveEndsAt = endsAt || new Date(new Date(startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();
    const venueCheck = await checkVenueAvailability(venueId, startsAt, effectiveEndsAt);
    if (!venueCheck.available) {
      return { error: venueCheck.conflictReason || "The selected venue has a scheduling conflict." };
    }
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

  // Attempt single-transaction RPC submit_event_proposal if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcEventId, error: rpcSubmitError } = await (supabase.rpc as any)(
    "submit_event_proposal",
    {
      p_title: title,
      p_slug: slug,
      p_org_id: orgId,
      p_college_id: collegeId ?? null,
      p_venue_id: venueId,
      p_starts_at: startsAt,
      p_ends_at: endsAt,
      p_reg_deadline: regDeadlineIso,
      p_capacity: capacity,
      p_category: category ?? "General",
      p_tier: dbTier,
      p_description: descArray,
      p_summary: descText ? descText.slice(0, 160) : "",
      p_memo: memo ?? null,
      p_doors_open_note: doorsOpenNote ?? null,
      p_coordinator_name: coordinatorName ?? null,
      p_coordinator_email: coordinatorEmail ?? null,
      p_coordinator_phone: coordinatorPhone ?? null,
      p_banner_color: bannerColor ?? "#6c0c28",
      p_qr_enabled: qrEnabled ?? true,
    }
  );

  let newEventId = rpcEventId as string | null;

  if (rpcSubmitError) {
    const rpcMsg = rpcSubmitError.message || "";
    // If error is an explicit business rule (capacity, conflict, authorization), fail immediately
    if (
      rpcMsg.includes("Target capacity") ||
      rpcMsg.includes("scheduling conflict") ||
      rpcMsg.includes("authorized")
    ) {
      return { error: rpcMsg };
    }

    // Fallback direct insert if function not yet applied in schema cache
    // Build insert payload without undefined / un-migrated columns
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventInsertPayload: Record<string, any> = {
      title,
      slug,
      organization_id: orgId,
      college_id: collegeId ?? null,
      venue_id: venueId,
      starts_at: startsAt,
      ends_at: endsAt,
      registration_deadline: regDeadlineIso,
      total_capacity: capacity,
      category: category ?? "General",
      tier: dbTier,
      approval: "pending",
      status: "draft",
      description: descArray,
      summary: descText ? descText.slice(0, 160) : "",
      doors_open_note: doorsOpenNote ?? null,
      coordinator_name: coordinatorName ?? null,
      coordinator_email: coordinatorEmail ?? null,
      coordinator_phone: coordinatorPhone ?? null,
      banner_color: bannerColor ?? "#6c0c28",
      created_by: user.id,
    };

    if (typeof qrEnabled === "boolean") {
      eventInsertPayload.qr_enabled = qrEnabled;
    }

    const firstAttempt = await supabase
      .from("events")
      .insert(eventInsertPayload as never)
      .select("id")
      .single();

    let insertData = firstAttempt.data as { id: string } | null;
    let insertError = firstAttempt.error;

    if (insertError && insertError.message?.includes("qr_enabled")) {
      delete eventInsertPayload.qr_enabled;
      const retryAttempt = await supabase
        .from("events")
        .insert(eventInsertPayload as never)
        .select("id")
        .single();

      insertData = retryAttempt.data as { id: string } | null;
      insertError = retryAttempt.error;
    }

    if (insertError || !insertData) return { error: insertError?.message ?? "Failed to create event" };

    newEventId = insertData.id;

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
      return { error: `Event created but approval submission failed: ${approvalInsertError.message}`, eventId: newEventId };
    }
  }

  revalidatePath("/organizer-dashboard");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");

  return { eventId: newEventId ?? undefined };
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
    .select("id, slug, title, approval, status, starts_at, ends_at, venue_id, total_capacity")
    .eq("id", eventId)
    .single();

  if (fetchErr || !existingEvent) return { error: "Event not found." };

  const nowMs = Date.now();
  const startsAtMs = existingEvent.starts_at ? new Date(existingEvent.starts_at).getTime() : 0;
  const isApproved = existingEvent.approval === "approved";

  // Check ongoing, completed, cancelled
  if (
    existingEvent.status === "ongoing" ||
    existingEvent.status === "completed" ||
    existingEvent.status === "cancelled" ||
    startsAtMs <= nowMs
  ) {
    return {
      error: "Ongoing, completed, cancelled, or past events cannot be edited.",
    };
  }

  // E3.2 Capacity Floor Check: ensure new capacity is not less than already-registered count
  if (capacity !== undefined) {
    const { data: statsRow } = await supabase
      .from("event_stats" as never)
      .select("registered_count")
      .eq("event_id" as never, eventId as never)
      .maybeSingle();

    const currentRegistered = Number((statsRow as { registered_count?: number } | null)?.registered_count ?? 0);
    if (capacity < currentRegistered) {
      return {
        error: `Cannot reduce capacity to ${capacity}. Already ${currentRegistered} students registered.`,
      };
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

  let newStartsAt = existingEvent.starts_at;
  let newEndsAt = existingEvent.ends_at;

  if (date) {
    try {
      const timeZoneSuffix = "+08:00";
      const startTimeFormatted = startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : "09:00:00";
      updates.starts_at = new Date(`${date}T${startTimeFormatted}${timeZoneSuffix}`).toISOString();
      newStartsAt = updates.starts_at;

      if (endTime) {
        const endTimeFormatted = endTime.length === 5 ? `${endTime}:00` : endTime;
        updates.ends_at = new Date(`${date}T${endTimeFormatted}${timeZoneSuffix}`).toISOString();
        newEndsAt = updates.ends_at;
      }
    } catch {
      return { error: "Invalid date or time provided." };
    }
  }

  // Check venue conflict if venue or times changed
  const targetVenueId = venueId ?? existingEvent.venue_id;
  if (targetVenueId && (venueId || date || startTime || endTime)) {
    const effectiveEndsAt = newEndsAt || new Date(new Date(newStartsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();
    const venueCheck = await checkVenueAvailability(targetVenueId, newStartsAt, effectiveEndsAt, eventId);
    if (!venueCheck.available) {
      return { error: venueCheck.conflictReason || "The venue has a scheduling conflict during the selected time." };
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

  // E3.4: If approved event had venue or schedule changed, notify registered students via RPC
  const venueChanged = venueId && venueId !== existingEvent.venue_id;
  const timeChanged = updates.starts_at && updates.starts_at !== existingEvent.starts_at;
  if (isApproved && (venueChanged || timeChanged)) {
    const changeDetails = [
      venueChanged ? "venue" : null,
      timeChanged ? "date/time" : null,
    ].filter(Boolean).join(" and ");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.rpc as any)("notify_event_registrants", {
      p_event: eventId,
      p_title: `Update: ${existingEvent.title}`,
      p_body: `Important: The ${changeDetails} for "${existingEvent.title}" has been updated by the organizer. Please check the event page for latest schedule.`,
      p_link: `/events/${existingEvent.slug}`,
    });
  }

  // Audit log of update
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: resubmitForReview ? "event.resubmit" : "event.update",
    entity: "events",
    entity_id: eventId,
    meta: { updates, previousApproval: existingEvent.approval },
  });

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

/* --------------------------------------------------------------------------
   cancelEvent – organizers / admins cancel an event and notify attendees
   -------------------------------------------------------------------------- */

export interface CancelEventResult {
  success?: boolean;
  error?: string;
}

export async function cancelEvent(
  eventId: string,
  reason: string
): Promise<CancelEventResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "You must be signed in." };

  if (!z.string().uuid().safeParse(eventId).success) {
    return { error: "Invalid event ID." };
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { error: "A cancellation reason is required." };
  }

  // Call the cancel_event RPC
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: rpcErr } = await (supabase.rpc as any)("cancel_event", {
    p_event: eventId,
    p_reason: trimmedReason,
  });

  if (rpcErr) {
    return { error: rpcErr.message };
  }

  revalidatePath("/organizer-dashboard");
  revalidatePath("/events");
  revalidatePath("/my-events");

  return { success: true };
}


