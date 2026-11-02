import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgEvents, getOrgRoster, getOrgProfile } from "@/lib/db/organizer";
import OrganizerDashboardClient from "./organizer-dashboard-client";

export const metadata: Metadata = {
  title: "Eventify | Organizer Dashboard",
  description:
    "Student Council and Student Organization portal for managing campus events, live attendance rosters, broadcasts, and approvals.",
};

export default async function OrganizerDashboardPage() {
  // Server-side auth + role guard (middleware also guards this route)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch in parallel
  const [profile, events, roster] = await Promise.all([
    getOrgProfile(),
    getOrgEvents(),
    getOrgRoster(),
  ]);

  return (
    <OrganizerDashboardClient
      initialEvents={events}
      initialRoster={roster}
      organizerName={profile?.fullName ?? "Organizer"}
      orgName={profile?.orgName ?? "My Organisation"}
    />
  );
}
