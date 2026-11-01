import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import OrOrganizersView from "@/component/admin/OrOrganizerView";
import "../admin.css";

export const metadata = {
  title: "Eventify - Event & Organizers",
};

export default function OrganizersPage() {
  return (
    <div className="admin-root or-root">
      <div className="shell">
        <Sidebar />
        <div className="content">
          <Header />
          <main className="main">
            <OrOrganizersView />
          </main>
        </div>
      </div>
    </div>
  );
}
