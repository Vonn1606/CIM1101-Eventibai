import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import KpiCards from "@/component/admin/KpiCards";
import FeaturedBanner from "@/component/admin/FeaturedBanner";
import Calendar from "@/component/admin/Calendar";
import UpcomingEvents from "@/component/admin/UpcomingEvents";
import { Plus } from "lucide-react";
import { getAdminStats, getFeaturedEvent, getUpcomingEvents, getAdminProfile } from "@/lib/db/stats";
import "./admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Admin Portal",
};

export default async function AdminPage() {
  const [stats, featuredEvent, upcomingEvents, adminProfile] = await Promise.all([
    getAdminStats(),
    getFeaturedEvent(),
    getUpcomingEvents(4),
    getAdminProfile(),
  ]);

  return (
    <div className="admin-root">
      <div className="shell">
        <Sidebar pendingApprovals={stats.pendingApprovals} />
        <div className="content">
          <Header profile={adminProfile} />
          <main className="main">
            <div className="container">
              <KpiCards stats={stats} />
              <FeaturedBanner event={featuredEvent ?? undefined} />
              <section className="grid">
                <Calendar events={upcomingEvents} featuredEvent={featuredEvent} />
                <UpcomingEvents events={upcomingEvents} />
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
