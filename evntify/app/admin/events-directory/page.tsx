import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import EdEventsView from "@/component/admin/EdEventsView";
import { getEventsDirectory, getPendingApprovalsCount } from "@/lib/db/stats";
import { getCurrentProfile } from "@/lib/auth/server";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Events Directory",
};

export default async function EventsDirectoryPage() {
  const [profile, eventsRes, pendingApprovals] = await Promise.all([
    getCurrentProfile(),
    getEventsDirectory(1, 12),
    getPendingApprovalsCount(),
  ]);

  const adminProfile = {
    name: profile?.fullName ?? "Admin Office",
    role: "Office of Student Affairs",
  };

  const { items, total } = eventsRes;

  return (
    <div className="admin-root ed-root">
      <div className="shell">
        <Sidebar pendingApprovals={pendingApprovals} />
        <div className="content">
          <Header profile={adminProfile} />
          <main className="main">
            <EdEventsView initialEvents={items} total={total} />
          </main>
        </div>
      </div>
    </div>
  );
}
