import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface UserOrganization {
  id: string;
  name: string;
  position: string;
  deptLabel?: string | null;
}

/**
 * Returns all organizations of which the user is an active member.
 */
export async function getMyOrganizations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<UserOrganization[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("organization_members")
    .select(`
      position,
      organization_id,
      organizations ( id, name, dept_label )
    `)
    .eq("user_id", userId);

  if (error || !data) return [];

  const orgs: UserOrganization[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any[]).forEach((row) => {
    const org = row.organizations;
    if (org && org.id) {
      orgs.push({
        id: org.id as string,
        name: (org.name ?? "Unnamed Organization") as string,
        position: (row.position ?? "Member") as string,
        deptLabel: org.dept_label ?? null,
      });
    }
  });

  return orgs;
}

/**
 * Resolves the user's active organization ID:
 * 1. Reads the `active_org_id` cookie.
 * 2. Validates that the user is actually a member of that organization.
 * 3. Falls back to the user's first organization membership.
 *
 * Wrapped in React.cache() so it runs once per server request.
 */
export const getActiveOrgId = cache(async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> => {
  const orgs = await getMyOrganizations(supabase, userId);
  if (orgs.length === 0) return null;

  const cookieStore = await cookies();
  const savedOrgId = cookieStore.get("active_org_id")?.value;

  if (savedOrgId) {
    const valid = orgs.some((o) => o.id === savedOrgId);
    if (valid) return savedOrgId;
  }

  // Fallback to first membership
  return orgs[0].id;
});
