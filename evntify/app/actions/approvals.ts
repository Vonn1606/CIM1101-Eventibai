"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Event Approvals ───────────────────────────────────────────────────────────

const decideSchema = z.object({
  approvalId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().optional(),
});

export type DecideResult = { error?: string; success?: boolean };

export async function decideApproval(
  input: z.infer<typeof decideSchema>
): Promise<DecideResult> {
  const parsed = decideSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profileRow as any)?.role !== "admin") return { error: "Unauthorized" };

  const { approvalId, decision, notes } = parsed.data;

  // 1. Update event_approvals
  const { data: approval, error: approvalErr } = await supabase
    .from("event_approvals")
    .update({
      decision,
      decided_at: new Date().toISOString(),
      reviewed_by: user.id,
      notes: notes ?? null,
    } as never)
    .eq("id", approvalId)
    .select("event_id, submitted_by")
    .single();

  if (approvalErr || !approval) return { error: approvalErr?.message ?? "Update failed" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const approvalRow = approval as any;
  const eventId = approvalRow.event_id;
  const submittedBy = approvalRow.submitted_by;

  // 2. Update events table
  await supabase
    .from("events")
    .update({
      approval: decision,
      ...(decision === "approved" ? { status: "open" } : {}),
    } as never)
    .eq("id", eventId);

  // 3. Write audit log
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: `event_${decision}`,
    target_type: "event",
    target_id: eventId,
    metadata: { approval_id: approvalId, notes: notes ?? null },
  } as never);

  // 4. Notify organizer
  if (submittedBy) {
    await supabase.from("notifications").insert({
      user_id: submittedBy,
      message: `Your event proposal has been ${decision}.`,
      link: `/events`,
    } as never);
  }

  revalidatePath("/admin/approvals");
  revalidatePath("/events");

  return { success: true };
}

