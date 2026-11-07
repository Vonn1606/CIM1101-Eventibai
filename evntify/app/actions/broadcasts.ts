"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SendBroadcastInput {
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

  const channels = input.channels.length > 0 ? input.channels : ["push"];

  // 1. Determine recipients (if eventId is provided, all registered students for that event)
  let recipientIds: string[] = [];
  let cohortLabel = "All Campus Students";

  if (input.eventId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: regRows } = await (supabase as any)
      .from("registrations")
      .select("user_id, events(title)")
      .eq("event_id", input.eventId);

    if (regRows && regRows.length > 0) {
      recipientIds = Array.from(
        new Set(regRows.map((r: { user_id: string }) => r.user_id).filter(Boolean))
      );
      const title = (regRows[0] as { events?: { title?: string } }).events?.title ?? "Selected Event";
      cohortLabel = `${title} (${recipientIds.length} Registered)`;
    } else {
      cohortLabel = `Event Registrants (0)`;
    }
  }

  // 2. Insert into broadcasts table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: broadcastRow, error: broadcastErr } = await (supabase as any)
    .from("broadcasts")
    .insert({
      event_id: input.eventId || null,
      sent_by: user.id,
      cohort_label: cohortLabel,
      message: trimmed,
      channels: channels,
      recipient_count: recipientIds.length,
    })
    .select("id")
    .single();

  if (broadcastErr) {
    return { error: broadcastErr.message };
  }

  const broadcastId = broadcastRow.id;

  // 3. Insert notification & broadcast_deliveries rows if there are recipients
  if (recipientIds.length > 0) {
    const notificationInserts = recipientIds.map((userId) => ({
      user_id: userId,
      title: "Campus Announcement",
      body: trimmed,
      link: input.eventId ? `/events/${input.eventId}` : "/events",
    }));

    const deliveryInserts = recipientIds.flatMap((userId) =>
      channels.map((ch) => ({
        broadcast_id: broadcastId,
        user_id: userId,
        channel: ch,
        status: "delivered",
        delivered_at: new Date().toISOString(),
      }))
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("notifications").insert(notificationInserts);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("broadcast_deliveries").insert(deliveryInserts);
  }

  revalidatePath("/organizer-dashboard");
  return {
    success: true,
    recipientCount: recipientIds.length,
    cohortLabel,
  };
}

export async function getBroadcastLogs(limit = 10): Promise<BroadcastLogItem[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("broadcasts")
    .select("id, message, sent_at, recipient_count, cohort_label, channels")
    .order("sent_at", { ascending: false })
    .limit(limit);

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

