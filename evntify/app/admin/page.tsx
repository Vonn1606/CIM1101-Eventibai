import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import KpiCards from "@/component/admin/KpiCards";
import FeaturedBanner from "@/component/admin/FeaturedBanner";
import Calendar from "@/component/admin/Calendar";
import UpcomingEvents from "@/component/admin/UpcomingEvents";
import { Plus } from "lucide-react";
import "./admin.css";

export const metadata = {
  title: "Eventify - Admin Portal",
};

export default function AdminPage() {
  return (
    <div className="shell">
      <Sidebar />
      <div className="content">
        <Header />
        <main className="main">
          <div className="container">
            <KpiCards />
            <FeaturedBanner />
            <section className="grid">
              <Calendar />
              <UpcomingEvents />
            </section>
          </div>
        </main>
      </div>
      <button className="fab">
        <Plus size={14} /> Add Event
      </button>
    </div>
  );
}

