"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SaveAdminNoteResult {
  success?: boolean;
  error?: string;
}

export interface SuspendEventResult {
  success?: boolean;
  error?: string;
}

export async function saveAdminNote(
  eventId: string,
  note: string
): Promise<SaveAdminNoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const trimmed = note.trim();
  if (!trimmed) return { error: "Note cannot be empty." };

  // Resolve event UUID if slug was passed
  let targetEventId = eventId;
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      eventId
    );
  if (!isUuid) {
    const { data: ev } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventId)
      .single();
    if (ev) targetEventId = ev.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("admin_notes").insert({
    event_id: targetEventId,
    author_id: user.id,
    note: trimmed,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/events-directory");
  return { success: true };
}

export async function suspendEvent(
  eventId: string,
  reason?: string
): Promise<SuspendEventResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden: only admins can suspend campus events." };
  }

  let targetEventId = eventId;
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      eventId
    );
  if (!isUuid) {
    const { data: ev } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventId)
      .single();
    if (ev) targetEventId = ev.id;
  }

  // Update status to 'suspended'
  const { error: updateErr } = await supabase
    .from("events")
    .update({ status: "suspended" })
    .eq("id", targetEventId);

  if (updateErr) return { error: updateErr.message };

  // Insert audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("audit_logs").insert({
    actor_id: user.id,
    action: "event_suspended",
    entity: "events",
    entity_id: targetEventId,
    meta: { reason: reason || "Administrative suspension via Inspector drawer" },
  });

  revalidatePath("/admin/events-directory");
  revalidatePath("/events");
  revalidatePath("/organizer-dashboard");

  return { success: true };
}

export async function getEventFacilities(
  eventId: string
): Promise<Array<{ label: string; value: string }>> {
  const supabase = await createClient();

  let targetEventId = eventId;
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      eventId
    );
  if (!isUuid) {
    const { data: ev } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventId)
      .single();
    if (ev) targetEventId = ev.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("event_facilities")
    .select("label, value")
    .eq("event_id", targetEventId);

  if (error || !data) return [];
  return data;
}

export async function getEventAdminNotes(
  eventId: string
): Promise<Array<{ id: string; note: string; createdAt: string }>> {
  const supabase = await createClient();

  let targetEventId = eventId;
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      eventId
    );
  if (!isUuid) {
    const { data: ev } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventId)
      .single();
    if (ev) targetEventId = ev.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("admin_notes")
    .select("id, note, created_at")
    .eq("event_id", targetEventId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((n: any) => ({
    id: n.id,
    note: n.note,
    createdAt: new Date(n.created_at).toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
}

