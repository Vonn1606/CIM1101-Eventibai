import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import EdEventsView from "@/component/admin/EdEventsView";
import { Plus } from "lucide-react";
import "./events-directory.css";

export const metadata = {
  title: "Eventify - Events Directory",
};

export default function EventsDirectoryPage() {
  return (
    <div className="ed-root">
      <div className="shell">
        <Sidebar />
        <div className="content">
          <Header />
          <main className="main">
            <EdEventsView />
          </main>
        </div>
        <button className="fab">
          <Plus size={14} /> Add Event
        </button>
      </div>
    </div>
  );
}

