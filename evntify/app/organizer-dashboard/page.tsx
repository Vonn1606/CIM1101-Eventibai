import type { Metadata } from "next";
import OrganizerDashboardClient from "./organizer-dashboard-client";
import RoleGuard from "@/component/auth/role-guard";

export const metadata: Metadata = {
  title: "Eventify | Organizer Dashboard",
  description:
    "Student Council and Student Organization portal for managing campus events, live attendance rosters, broadcasts, and approvals.",
};

export default function OrganizerDashboardPage() {
  return (
    <RoleGuard allowedRole="organizer">
      <OrganizerDashboardClient />
    </RoleGuard>
  );
}
