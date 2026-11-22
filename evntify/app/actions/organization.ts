"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const OrgIdSchema = z.string().uuid("Invalid organization ID format");

export interface SetActiveOrgResult {
  success?: boolean;
  error?: string;
  activeOrgId?: string;
}

export async function setActiveOrganization(orgId: string): Promise<SetActiveOrgResult> {
  const parsed = OrgIdSchema.safeParse(orgId);
  if (!parsed.success) {
    return { error: "Invalid organization ID." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to select an active organization." };
  }

  // Check admin role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as { role?: string } | null)?.role === "admin";

  // If not admin, check membership in organization_members
  if (!isAdmin) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: membership } = await (supabase as any)
      .from("organization_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", parsed.data)
      .maybeSingle();

    if (!membership) {
      return { error: "You are not a member of this organization." };
    }
  }

  // Set the cookie
  const cookieStore = await cookies();
  cookieStore.set("active_org_id", parsed.data, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  revalidatePath("/organizer-dashboard");
  revalidatePath("/my-events");
  revalidatePath("/organizer-dashboard/create-event");

  return { success: true, activeOrgId: parsed.data };
}
