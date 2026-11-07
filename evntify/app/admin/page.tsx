import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import KpiCards from "@/component/admin/KpiCards";
import FeaturedBanner from "@/component/admin/FeaturedBanner";
import Calendar from "@/component/admin/Calendar";
import UpcomingEvents from "@/component/admin/UpcomingEvents";
import { getAdminDashboardKpis } from "@/lib/db/admin";
import { Plus } from "lucide-react";
import "./admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const instant = false;

export const metadata = {
  title: "Eventify - Admin Portal",
};

export default async function AdminPage() {
  const kpis = await getAdminDashboardKpis();

  return (
    <div className="admin-root">
      <div className="shell">
        <Sidebar />
        <div className="content">
          <Header />
          <main className="main">
            <div className="container">
              <KpiCards kpis={kpis} />
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
    </div>
  );
}
