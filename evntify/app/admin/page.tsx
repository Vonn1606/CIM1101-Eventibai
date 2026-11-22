import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import KpiCards from "@/component/admin/KpiCards";
import FeaturedBanner from "@/component/admin/FeaturedBanner";
import Calendar from "@/component/admin/Calendar";
import UpcomingEvents from "@/component/admin/UpcomingEvents";
import { getAdminStats, getFeaturedEvent, getUpcomingEvents, getCalendarEvents } from "@/lib/db/stats";
import { getCurrentProfile } from "@/lib/auth/server";
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

  // Auth and admin role are already verified by AdminLayout via cached getCurrentProfile()
  const [profile, stats, featuredEvent, upcomingEvents, calendarEvents] = await Promise.all([
    getCurrentProfile(),
    getAdminStats(),
    getFeaturedEvent(),
    getUpcomingEvents(4),
    getCalendarEvents(manilaYear, manilaMonth),
  ]);

  const adminProfile = {
    name: profile?.fullName ?? "Admin Office",
    role: "Office of Student Affairs",
  };

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
