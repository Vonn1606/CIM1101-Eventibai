import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgEvents, getOrgRoster } from "@/lib/db/organizer";
import { getMyOrganizations, getActiveOrgId } from "@/lib/db/active-org";
import OrganizerDashboardClient from "./organizer-dashboard-client";

export const metadata: Metadata = {
  title: "Eventify | Organizer Dashboard",
  description:
    "Student Council and Student Organization portal for managing campus events, live attendance rosters, broadcasts, and approvals.",
};

export default async function OrganizerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Fetch profile and all memberships
  const [profileRes, userOrgs, activeOrgId] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single(),
    getMyOrganizations(supabase, user.id),
    getActiveOrgId(supabase, user.id),
  ]);

  const profile = profileRes.data;
  if (profile?.role !== "organizer" && profile?.role !== "admin") redirect("/my-events");

  const effectiveOrgId = activeOrgId ?? userOrgs[0]?.id;
  const activeOrg = userOrgs.find((o) => o.id === effectiveOrgId) ?? userOrgs[0];
  const orgName: string = activeOrg?.name ?? "My Organisation";
  const organizerName: string = profile?.full_name ?? "Organizer";

  // Find the first approved event ID from events (populated by getOrgEvents)
  // We pass effectiveOrgId so getOrgEvents skips its own auth + membership lookup
  let events: Awaited<ReturnType<typeof getOrgEvents>> = [];
  let venuesData: { id: string; name: string; capacity: number }[] = [];
  let roster: Awaited<ReturnType<typeof getOrgRoster>> = [];

  try {
    const [eventsRes, venuesRes] = await Promise.all([
      getOrgEvents(effectiveOrgId),
      supabase.from("venues").select("id, name, capacity").order("name"),
    ]);
    events = eventsRes;
    venuesData = (venuesRes.data ?? []).map((v) => ({ ...v, capacity: v.capacity ?? 0 }));

    // Use the most recent approved event from the already-fetched list to seed the roster
    const firstApprovedEvent = events.find((e) => e.status === "live" || e.status === "soldout" || e.status === "completed");
    const rosterEventId = firstApprovedEvent?.id;
    const rosterEventCategory = firstApprovedEvent?.tier;

    roster = await getOrgRoster(rosterEventId, rosterEventCategory);
  } catch (err) {
    console.error("[OrganizerDashboardPage] Data fetch error:", err);
  }

  return (
    <OrganizerDashboardClient
      initialEvents={events}
      initialRoster={roster}
      organizerName={organizerName}
      orgName={orgName}
      venues={venuesData}
      organizations={userOrgs}
      activeOrgId={effectiveOrgId}
    />
  );
}
