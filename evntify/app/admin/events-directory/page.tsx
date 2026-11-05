import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import EdEventsView from "@/component/admin/EdEventsView";
import { Plus } from "lucide-react";
import { getEventsDirectory, getAdminProfile, getAdminStats } from "@/lib/db/stats";
import "../admin.css";

export const metadata = {
  title: "Eventify - Events Directory",
};

export default async function EventsDirectoryPage() {
  const [{ items, total }, adminProfile, stats] = await Promise.all([
    getEventsDirectory(1, 12),
    getAdminProfile(),
    getAdminStats(),
  ]);

  return (
    <div className="admin-root ed-root">
      <div className="shell">
        <Sidebar pendingApprovals={stats.pendingApprovals} />
        <div className="content">
          <Header profile={adminProfile} />
          <main className="main">
            <EdEventsView initialEvents={items} total={total} />
          </main>
        </div>
        <button className="fab">
          <Plus size={14} /> Add Event
        </button>
      </div>
    </div>
  );
}
