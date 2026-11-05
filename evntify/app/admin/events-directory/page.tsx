import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import EdEventsView from "@/component/admin/EdEventsView";
import { getAdminEvents } from "@/lib/db/admin";
import { Plus } from "lucide-react";
import { getEventsDirectory, getAdminProfile, getAdminStats } from "@/lib/db/stats";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const instant = false;

export const metadata = {
  title: "Eventify - Events Directory",
};

export default async function EventsDirectoryPage() {
<<<<<<< Updated upstream
  const [{ items, total }, adminProfile, stats] = await Promise.all([
    getEventsDirectory(1, 12),
    getAdminProfile(),
    getAdminStats(),
  ]);
=======
  const events = await getAdminEvents();
>>>>>>> Stashed changes

  return (
    <div className="admin-root ed-root">
      <div className="shell">
        <Sidebar pendingApprovals={stats.pendingApprovals} />
        <div className="content">
          <Header profile={adminProfile} />
          <main className="main">
<<<<<<< Updated upstream
            <EdEventsView initialEvents={items} total={total} />
=======
            <EdEventsView initialEvents={events} />
>>>>>>> Stashed changes
          </main>
        </div>
        <button className="fab">
          <Plus size={14} /> Add Event
        </button>
      </div>
    </div>
  );
}