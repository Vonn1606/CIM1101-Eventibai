"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Event Approvals ───────────────────────────────────────────────────────────

const decideSchema = z.object({
  approvalId: z.string().uuid(),
  decision: z.enum(["approved", "rejected", "declined", "returned"]),
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
  const dbDecision =
    decision === "rejected" || decision === "declined" ? "declined" : decision;

  // 1. Update event_approvals (schema uses decision_note, not notes)
  const { data: approval, error: approvalErr } = await supabase
    .from("event_approvals")
    .update({
      decision: dbDecision,
      decided_at: new Date().toISOString(),
      reviewed_by: user.id,
      decision_note: notes ?? null,
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
      approval: dbDecision,
      ...(dbDecision === "approved"
        ? { status: "open" }
        : dbDecision === "returned"
          ? { status: "draft" }
          : { status: "cancelled" }),
    } as never)
    .eq("id", eventId);

  // 3. Write audit log (schema uses actor_id, action, entity, entity_id, meta)
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: `proposal.${dbDecision}`,
    entity: "event",
    entity_id: eventId,
    meta: { approval_id: approvalId, decision_note: notes ?? null },
  } as never);

  // 4. Notify organizer (schema uses user_id, title, body, link)
  if (submittedBy) {
    const actionText =
      dbDecision === "approved"
        ? "approved"
        : dbDecision === "returned"
          ? "returned for edits"
          : "declined";

    await supabase.from("notifications").insert({
      user_id: submittedBy,
      title: `Event Proposal ${actionText.toUpperCase()}`,
      body: `Your event proposal has been ${actionText}.${notes ? ` Notes: ${notes}` : ""}`,
      link: `/organizer-dashboard`,
    } as never);
  }

  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath("/organizer-dashboard");

  return { success: true };
}
