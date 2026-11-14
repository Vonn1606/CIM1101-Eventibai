"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SendBroadcastInput {
  /** Required: broadcasts are scoped to an event the caller owns. */
  eventId?: string;
  message: string;
  channels: ("push" | "sms" | "discord")[];
}

export interface BroadcastLogItem {
  id: string;
  message: string;
  sentAt: string;
  recipientCount: number;
  cohortLabel: string;
  channels: string[];
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function sendBroadcast(input: SendBroadcastInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to send broadcasts." };
  }

  const trimmed = input.message.trim();
  if (!trimmed) {
    return { error: "Broadcast message cannot be empty." };
  }
  if (trimmed.length > 240) {
    return { error: "Broadcast message exceeds 240 characters." };
  }

  // The DB function and RLS only allow broadcasts scoped to an owned event.
  if (!input.eventId || !UUID_RE.test(input.eventId)) {
    return { error: "Select one of your events to broadcast to." };
  }
  const eventId = input.eventId;

  const channels = input.channels.length > 0 ? input.channels : ["push"];

  // Cohort label shown in logs (the RPC stores it as-is).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evRow } = await (supabase as any)
    .from("events")
    .select("title")
    .eq("id", eventId)
    .maybeSingle();
  const cohortLabel = `${(evRow as { title?: string } | null)?.title ?? "Selected Event"} (Registered)`;

  // Item 4: one transaction — ownership check, recipient fan-out, push rows
  // delivered, sms/discord rows 'queued', and the audit log entry.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: broadcastId, error: rpcErr } = await (supabase.rpc as any)(
    "send_broadcast",
    {
      p_event: eventId,
      p_cohort: cohortLabel,
      p_message: trimmed,
      p_channels: channels,
    }
  );

  if (rpcErr) {
    if (/not allowed/i.test(rpcErr.message)) {
      return { error: "You do not have permission to broadcast for this event." };
    }
    return { error: rpcErr.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase as any)
    .from("broadcasts")
    .select("recipient_count")
    .eq("id", broadcastId as string)
    .maybeSingle();

  revalidatePath("/organizer-dashboard");
  return {
    success: true,
    recipientCount: Number((row as { recipient_count?: number } | null)?.recipient_count ?? 0),
    cohortLabel,
  };
}

/**
 * RLS ("owners read broadcasts") already limits rows to events the caller
 * owns (admins see all); eventId optionally narrows to one event.
 */
export async function getBroadcastLogs(
  limit = 10,
  eventId?: string
): Promise<BroadcastLogItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("broadcasts")
    .select("id, message, sent_at, recipient_count, cohort_label, channels")
    .not("event_id", "is", null)
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (eventId && UUID_RE.test(eventId)) {
    query = query.eq("event_id", eventId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((b: any) => ({
    id: b.id,
    message: b.message,
    sentAt: new Date(b.sent_at).toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    recipientCount: b.recipient_count ?? 0,
    cohortLabel: b.cohort_label,
    channels: b.channels ?? ["push"],
  }));
}
