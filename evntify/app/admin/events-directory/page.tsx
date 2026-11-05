import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import EdEventsView from "@/component/admin/EdEventsView";
import { getAdminEvents } from "@/lib/db/admin";
import { Plus } from "lucide-react";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const instant = false;

export const metadata = {
  title: "Eventify - Events Directory",
};

export default async function EventsDirectoryPage() {
  const events = await getAdminEvents();

  return (
    <div className="admin-root ed-root">
      <div className="shell">
        <Sidebar />
        <div className="content">
          <Header />
          <main className="main">
            <EdEventsView initialEvents={events} />
          </main>
        </div>
        <button className="fab">
          <Plus size={14} /> Add Event
        </button>
      </div>
    </div>
  );
}