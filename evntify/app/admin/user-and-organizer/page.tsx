import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import OrOrganizersView from "@/component/admin/OrOrganizerView";
<<<<<<< Updated upstream
import { getOrganizers, getAdminProfile, getAdminStats } from "@/lib/db/stats";
=======
import { getAdminOrganizers } from "@/lib/db/admin";
>>>>>>> Stashed changes
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const instant = false;

export const metadata = {
  title: "Eventify - Event & Organizers",
};

export default async function OrganizersPage() {
<<<<<<< Updated upstream
  const [organizers, adminProfile, stats] = await Promise.all([
    getOrganizers(),
    getAdminProfile(),
    getAdminStats(),
  ]);
=======
  const organizers = await getAdminOrganizers();
>>>>>>> Stashed changes

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
