import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface UserOrganization {
  id: string;
  name: string;
  position: string;
  deptLabel?: string | null;
  collegeName?: string | null;
  shortName?: string | null;
  initials?: string | null;
  category?: string | null;
  memberCount?: number;
  upcomingEventsCount?: number;
}

/**
 * Returns all organizations of which the user is an active member,
 * along with real member counts and upcoming event counts from the database.
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
      organizations (
        id,
        name,
        dept_label,
        short_name,
        initials,
        college_id,
        colleges ( name, short_name )
      )
    `)
    .eq("user_id", userId);

  if (error || !data) return [];

  const orgs: UserOrganization[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any[]).forEach((row) => {
    const org = row.organizations;
    if (org && org.id) {
      const collegeName = org.colleges?.name ?? null;
      const deptLabel = org.dept_label ?? collegeName ?? null;
      const category = deptLabel || collegeName || "Student Organization";

      orgs.push({
        id: org.id as string,
        name: (org.name ?? "Unnamed Organization") as string,
        position: (row.position ?? "Member") as string,
        deptLabel,
        collegeName,
        shortName: org.short_name ?? null,
        initials: org.initials ?? null,
        category,
        memberCount: 1,
        upcomingEventsCount: 0,
      });
    }
  });

  if (orgs.length > 0) {
    const orgIds = orgs.map((o) => o.id);
    const nowIso = new Date().toISOString();

    // Query real member counts and real upcoming events in parallel
    await Promise.all([
      // 1. Real member counts
      (async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: memberCountRows } = await (supabase.rpc as any)(
            "get_organization_member_counts",
            { p_org_ids: orgIds }
          );

          if (memberCountRows && memberCountRows.length > 0) {
            const mCounts: Record<string, number> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            memberCountRows.forEach((row: any) => {
              mCounts[row.organization_id] = Number(row.member_count);
            });
            orgs.forEach((o) => {
              if (mCounts[o.id] !== undefined) {
                o.memberCount = mCounts[o.id];
              }
            });
          } else {
            // Direct table fallback
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: mRows } = await (supabase as any)
              .from("organization_members")
              .select("organization_id")
              .in("organization_id", orgIds);

            if (mRows && mRows.length > 0) {
              const mCounts: Record<string, number> = {};
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mRows.forEach((row: any) => {
                mCounts[row.organization_id] = (mCounts[row.organization_id] || 0) + 1;
              });
              orgs.forEach((o) => {
                if (mCounts[o.id] !== undefined) {
                  o.memberCount = mCounts[o.id];
                }
              });
            }
          }
        } catch {
          // Default baseline maintained
        }
      })(),

      // 2. Real upcoming events
      (async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: eventRows } = await (supabase as any)
            .from("events")
            .select("organization_id")
            .in("organization_id", orgIds)
            .gte("starts_at", nowIso)
            .neq("status", "cancelled");

          if (eventRows) {
            const counts: Record<string, number> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eventRows.forEach((e: any) => {
              counts[e.organization_id] = (counts[e.organization_id] || 0) + 1;
            });
            orgs.forEach((o) => {
              o.upcomingEventsCount = counts[o.id] ?? 0;
            });
          }
        } catch {
          // Default baseline maintained
        }
      })(),
    ]);
  }

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
