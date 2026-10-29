import type { Metadata } from "next";
import OrganizerDashboardClient from "./organizer-dashboard-client";

export const metadata: Metadata = {
  title: "Eventify | Organizer Dashboard",
  description:
    "Student Council and Student Organization portal for managing campus events, live attendance rosters, broadcasts, and approvals.",
};

export default function OrganizerDashboardPage() {
  return <OrganizerDashboardClient />;
}
