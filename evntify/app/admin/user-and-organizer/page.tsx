import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import OrOrganizersView from "@/component/admin/OrOrganizerView";
import { getAdminOrganizers } from "@/lib/db/admin";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const instant = false;

export const metadata = {
  title: "Eventify - Event & Organizers",
};

export default async function OrganizersPage() {
  const organizers = await getAdminOrganizers();

  return (
    <div className="admin-root or-root">
      <div className="shell">
        <Sidebar />
        <div className="content">
          <Header />
          <main className="main">
            <OrOrganizersView initialOrganizers={organizers} />
          </main>
        </div>
      </div>
    </div>
  );
}
