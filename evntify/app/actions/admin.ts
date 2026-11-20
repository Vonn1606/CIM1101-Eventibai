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

export async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Forbidden: administrator privileges required." };
  }
  return { ok: true };
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

  const adminCheck = await requireAdmin(supabase, user.id);
  if (!adminCheck.ok) return { error: adminCheck.error };

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

  const { error } = await supabase.from("admin_notes").insert({
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

  const adminCheck = await requireAdmin(supabase, user.id);
  if (!adminCheck.ok) return { error: adminCheck.error };

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

  // Update status and audit log via RPC
  const { error: rpcErr } = await supabase.rpc("suspend_event", {
    p_event: targetEventId,
    p_reason: reason || "Administrative suspension via Inspector drawer",
  });

  if (rpcErr) {
    // Fallback direct update if function not deployed
    const { error: updateErr } = await supabase
      .from("events")
      .update({ status: "suspended" })
      .eq("id", targetEventId);

    if (updateErr) return { error: updateErr.message };

    // Use log_audit RPC — direct insert is blocked by RLS
    await supabase.rpc("log_audit", {
      p_action: "event.suspend",
      p_entity: "event",
      p_entity_id: targetEventId,
      p_meta: { reason: reason || "Administrative suspension via Inspector drawer" },
    });
  }

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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from("admin_notes")
    .select("id, note, created_at")
    .eq("event_id", targetEventId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((n) => ({
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

export interface SetFeaturedResult {
  success?: boolean;
  error?: string;
}

export async function setFeatured(
  eventId: string,
  isFeatured: boolean,
  rank?: number | null
): Promise<SetFeaturedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const adminCheck = await requireAdmin(supabase, user.id);
  if (!adminCheck.ok) return { error: adminCheck.error };

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

  const { error } = await supabase
    .from("events")
    .update({
      is_featured: isFeatured,
      featured_rank: isFeatured ? (rank ?? 1) : null,
    })
    .eq("id", targetEventId);

  if (error) return { error: error.message };

  // Use log_audit RPC — direct insert is blocked by RLS
  await supabase.rpc("log_audit", {
    p_action: isFeatured ? "event.featured" : "event.unfeatured",
    p_entity: "event",
    p_entity_id: targetEventId,
    p_meta: { isFeatured, rank: isFeatured ? (rank ?? 1) : null },
  });

  revalidatePath("/admin/events-directory");
  revalidatePath("/events");
  revalidatePath("/");

  return { success: true };
}


