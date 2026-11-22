import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import EdEventsView from "@/component/admin/EdEventsView";
import { getEventsDirectory, getAdminProfile, getPendingApprovalsCount } from "@/lib/db/stats";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Events Directory",
};

export default async function EventsDirectoryPage() {
  const [{ items, total }, adminProfile, pendingApprovals] = await Promise.all([
    getEventsDirectory(1, 12),
    getAdminProfile(),
    getPendingApprovalsCount(),
  ]);

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
