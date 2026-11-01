import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeBar from "@/components/WelcomeBar";
import CalendarCard from "@/components/CalendarCard";
import SelectedDayPreview from "@/components/SelectedDayPreview";
import { PastCard, UpcomingCard } from "@/components/EventCards";
import { past, upcoming } from "@/lib/events";
import RoleGuard from "@/component/auth/role-guard";

export const metadata: Metadata = {
  title: "My Events | Eventify",
  description: "View and manage your registered campus events, calendar schedules, and attended activities.",
};

export default function MyEventsPage() {
  return (
    <RoleGuard allowedRole="user">
      <Header />
      <main className="min-h-[576px] bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 lg:px-10 py-8">
          <WelcomeBar upcoming={upcoming.length} past={past.length} />

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,488px)_1fr]">
            <aside className="flex flex-col gap-5 lg:sticky lg:top-28">
              <CalendarCard />
              <SelectedDayPreview />
            </aside>

            <div className="flex flex-col gap-8">
              <section className="flex flex-col gap-3" aria-labelledby="upcoming-h">
                <h2 id="upcoming-h" className="text-2xl font-bold tracking-[-0.24px] text-ink">
                  Upcoming Events
                </h2>
                {upcoming.map((e) => (
                  <UpcomingCard key={e.id} e={e} />
                ))}
              </section>

              <section className="flex flex-col gap-3 pt-3" aria-labelledby="past-h">
                <div className="flex items-center gap-2">
                  <h2 id="past-h" className="text-2xl font-bold tracking-[-0.24px] text-muted">
                    Past Events
                  </h2>
                  <span className="rounded-full bg-surface-high px-2.5 py-0.5 text-[10px] font-bold tracking-[0.6px] text-muted">
                    {past.length} concluded
                  </span>
                </div>
                {past.map((e) => (
                  <PastCard key={e.id} e={e} />
                ))}
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </RoleGuard>
  );
}
