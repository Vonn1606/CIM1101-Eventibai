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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { approvalId, decision, notes } = parsed.data;
  const dbDecision =
    decision === "rejected" || decision === "declined" ? "declined" : decision;

  // Item 5: a single DB transaction. The function enforces admin-only and
  // 'pending'-only, updates event_approvals + events (approved => open),
  // notifies the organizer and writes the audit log.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)("decide_approval", {
    p_approval: approvalId,
    p_decision: dbDecision,
    p_note: notes ?? null,
  });

  if (error) {
    const msg = String(error.message ?? "").toLowerCase();
    if (msg.includes("admin only")) return { error: "Unauthorized" };
    if (msg.includes("already decided")) {
      return { error: "This proposal has already been decided." };
    }
    if (msg.includes("not found")) return { error: "Approval record not found." };
    return { error: error.message };
  }

  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath("/organizer-dashboard");

  return { success: true };
}
