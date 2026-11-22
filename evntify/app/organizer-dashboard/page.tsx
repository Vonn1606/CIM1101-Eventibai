import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgEvents, getOrgRoster } from "@/lib/db/organizer";
import OrganizerDashboardClient from "./organizer-dashboard-client";

export const metadata: Metadata = {
  title: "Eventify | Organizer Dashboard",
  description:
    "Student Council and Student Organization portal for managing campus events, live attendance rosters, broadcasts, and approvals.",
};

export default async function OrganizerDashboardPage() {
  // Fix #2: Resolve user + profile + org membership in a single query at top level
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role, full_name, organization_members ( organization_id, organizations ( name ) )")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "organizer" && profile?.role !== "admin") redirect("/my-events");

  // Extract org info from the single profile query — no extra round-trips
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const member = Array.isArray(profile?.organization_members) ? (profile.organization_members as any[])[0] : null;
  const orgId: string | undefined = member?.organization_id;
  const orgName: string = member?.organizations?.name ?? "My Organisation";
  const organizerName: string = profile?.full_name ?? "Organizer";

  // Find the first approved event ID from events (populated by getOrgEvents)
  // We pass orgId so getOrgEvents skips its own auth + membership lookup
  let events: Awaited<ReturnType<typeof getOrgEvents>> = [];
  let venuesData: { id: string; name: string; capacity: number }[] = [];
  let roster: Awaited<ReturnType<typeof getOrgRoster>> = [];

  try {
    const [eventsRes, venuesRes] = await Promise.all([
      getOrgEvents(orgId),
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
    />
  );
}
