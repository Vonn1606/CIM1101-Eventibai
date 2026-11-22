import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import KpiCards from "@/component/admin/KpiCards";
import FeaturedBanner from "@/component/admin/FeaturedBanner";
import Calendar from "@/component/admin/Calendar";
import UpcomingEvents from "@/component/admin/UpcomingEvents";
import { getAdminStats, getFeaturedEvent, getUpcomingEvents, getAdminProfile, getCalendarEvents } from "@/lib/db/stats";
import "./admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Admin Portal",
};

interface AdminPageProps {
  searchParams?: Promise<{ m?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const now = new Date();
  let manilaYear = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric" }).format(now)
  );
  let manilaMonth =
    Number(
      new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", month: "numeric" }).format(now)
    ) - 1; // 0-based

  if (params.m && /^\d{4}-\d{2}$/.test(params.m)) {
    const [y, m] = params.m.split("-").map(Number);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      manilaYear = y;
      manilaMonth = m - 1;
    }
  }

  const [stats, featuredEvent, upcomingEvents, adminProfile, calendarEvents] = await Promise.all([
    getAdminStats(),
    getFeaturedEvent(),
    getUpcomingEvents(4),
    getAdminProfile(),
    getCalendarEvents(manilaYear, manilaMonth),
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
                <Calendar
                  events={calendarEvents}
                  featuredEvent={featuredEvent}
                  year={manilaYear}
                  month={manilaMonth}
                />
                <UpcomingEvents events={upcomingEvents} />
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
