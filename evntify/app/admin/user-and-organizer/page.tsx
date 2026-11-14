import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import OrOrganizersView from "@/component/admin/OrOrganizerView";
import { getOrganizers, getAdminProfile, getAdminStats } from "@/lib/db/stats";
import { getOrganizerApplications } from "@/app/actions/organizer-application";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Event & Organizers",
};

export default async function OrganizersPage() {
  const [organizers, applications, adminProfile, stats] = await Promise.all([
    getOrganizers(),
    getOrganizerApplications(),
    getAdminProfile(),
    getAdminStats(),
  ]);

  return (
    <div className="admin-root or-root">
      <div className="shell">
        <Sidebar pendingApprovals={stats.pendingApprovals} />
        <div className="content">
          <Header profile={adminProfile} />
          <main className="main">
            <OrOrganizersView initialOrganizers={organizers} initialApplications={applications} />
          </main>
        </div>
      </div>
    </div>
  );
}
