import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgEvents } from "@/lib/db/organizer";
import { getMyOrganizations, resolveActiveOrgId } from "@/lib/db/active-org";
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

  // Fetch profile and all memberships once
  const [profileRes, userOrgs] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single(),
    getMyOrganizations(supabase, user.id),
  ]);
  const activeOrgId = await resolveActiveOrgId(userOrgs);

  const profile = profileRes.data;
  if (profile?.role !== "organizer" && profile?.role !== "admin") redirect("/my-events");

  const effectiveOrgId = activeOrgId ?? userOrgs[0]?.id;
  const activeOrg = userOrgs.find((o) => o.id === effectiveOrgId) ?? userOrgs[0];
  const orgName: string = activeOrg?.name ?? "My Organisation";
  const organizerName: string = profile?.full_name ?? "Organizer";

  // Fetch events and venues in parallel; roster is loaded lazily on demand
  let events: Awaited<ReturnType<typeof getOrgEvents>> = [];
  let venuesData: { id: string; name: string; capacity: number }[] = [];

  try {
    const [eventsRes, venuesRes] = await Promise.all([
      getOrgEvents(effectiveOrgId),
      supabase.from("venues").select("id, name, capacity").order("name"),
    ]);
    events = eventsRes;
    venuesData = (venuesRes.data ?? []).map((v) => ({ ...v, capacity: v.capacity ?? 0 }));
  } catch (err) {
    console.error("[OrganizerDashboardPage] Data fetch error:", err);
  }

  return (
    <OrganizerDashboardClient
      initialEvents={events}
      initialRoster={[]}
      organizerName={organizerName}
      orgName={orgName}
      venues={venuesData}
      organizations={userOrgs}
      activeOrgId={effectiveOrgId}
    />
  );
}
