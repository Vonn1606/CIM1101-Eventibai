import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import OrOrganizersView from "@/component/admin/OrOrganizerView";
import { getOrganizers, getAdminProfile, getAdminStats } from "@/lib/db/stats";
import "../admin.css";

export const metadata = {
  title: "Eventify - Event & Organizers",
};

export default async function OrganizersPage() {
  const [organizers, adminProfile, stats] = await Promise.all([
    getOrganizers(),
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
            <OrOrganizersView initialOrganizers={organizers} />
          </main>
        </div>
      </div>
    </div>
  );
}
