import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyRegistrations } from "@/app/actions/registration";
import type { UpcomingEvent, PastEvent } from "@/app/actions/registration";
import Header from "@/component/user-profile/Header";
import Footer from "@/component/user-profile/Footer";
import WelcomeBar from "@/component/user-profile/WelcomeBar";
import CalendarCard from "@/component/user-profile/CalendarCard";
import SelectedDayPreview from "@/component/user-profile/SelectedDayPreview";
import { PastCard, UpcomingCard } from "@/component/user-profile/EventCards";

export const metadata: Metadata = {
  title: "My Events | Eventify",
  description: "View and manage your registered campus events, calendar schedules, and attended activities.",
};

/** Format an ISO date string to a human-readable date (e.g. "Nov 2, 2026") */
function formatDate(isoDate: string | null): string {
  if (!isoDate) return "TBA";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric" });
}

/** Format an ISO date string to a time string (e.g. "6:00 PM") */
function formatTime(isoDate: string | null): string {
  if (!isoDate) return "TBA";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" });
}

/** Build a calendar object for the given month */
function buildCalendar(
  year: number,
  month: number, // 0-indexed
  registrations: { event: { starts_at: string | null } }[]
) {
  const firstDay = new Date(year, month, 1);
  const dowOfFirst = firstDay.getDay(); // 0=Sun

  // Days from the previous month to fill the leading tail
  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevTail = dowOfFirst === 0
    ? []
    : Array.from({ length: dowOfFirst }, (_, i) => prevMonthDays - dowOfFirst + i + 1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Days that have a registration in this month
  const registered = registrations
    .map((r) => {
      if (!r.event.starts_at) return null;
      const d = new Date(r.event.starts_at);
      if (d.getFullYear() === year && d.getMonth() === month) return d.getDate();
      return null;
    })
    .filter((d): d is number => d !== null);

  return {
    monthLabel,
    prevTail,
    days: daysInMonth,
    featured: 0,
    registered: [...new Set(registered)],
  };
}

export default async function MyEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/my-events");
  }

  const { upcoming: upcomingRegs, past: pastRegs } = await getMyRegistrations(user.id);

  // Map MyRegistration → UpcomingEvent
  const upcomingEvents: UpcomingEvent[] = upcomingRegs.map((r) => ({
    id: r.id,
    headerLabel: "Registered event",
    headerColor: "bg-charcoal",
    featured: false,
    date: formatDate(r.event.starts_at),
    title: r.event.title,
    description: r.event.category ?? "",
    qrCode: r.ticket_code,
    venue: r.event.venue,
    meta: formatTime(r.event.starts_at),
  }));

  // Map MyRegistration → PastEvent
  const pastEvents: PastEvent[] = pastRegs.map((r) => ({
    id: r.id,
    date: formatDate(r.event.starts_at),
    title: r.event.title,
    description: r.event.category ?? "",
    venue: r.event.venue,
    meta: r.has_checked_in ? "Verified attendance" : "Not checked in",
    status: r.has_checked_in ? "attended" : "missed",
    footer: r.has_checked_in ? "Checked in ✓" : "Not checked in",
  }));

  // Build calendar for the current month
  const now = new Date();
  const calendarData = buildCalendar(now.getFullYear(), now.getMonth(), [
    ...upcomingRegs,
    ...pastRegs,
  ]);

  return (
    <>
      <Header />
      <main className="min-h-[576px] bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 lg:px-10 py-8">
          <WelcomeBar upcoming={upcomingEvents.length} past={pastEvents.length} />

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,488px)_1fr]">
            <aside className="flex flex-col gap-5 lg:sticky lg:top-28">
              <CalendarCard
                monthLabel={calendarData.monthLabel}
                prevTail={calendarData.prevTail}
                days={calendarData.days}
                featured={calendarData.featured}
                registered={calendarData.registered}
              />
              <SelectedDayPreview />
            </aside>

            <div className="flex flex-col gap-8">
              <section className="flex flex-col gap-3" aria-labelledby="upcoming-h">
                <h2 id="upcoming-h" className="text-2xl font-bold tracking-[-0.24px] text-ink">
                  Upcoming Events
                </h2>
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-muted">No upcoming registrations.</p>
                )}
                {upcomingEvents.map((e) => (
                  <UpcomingCard key={e.id} e={e} />
                ))}
              </section>

              <section className="flex flex-col gap-3 pt-3" aria-labelledby="past-h">
                <div className="flex items-center gap-2">
                  <h2 id="past-h" className="text-2xl font-bold tracking-[-0.24px] text-muted">
                    Past Events
                  </h2>
                  <span className="rounded-full bg-surface-high px-2.5 py-0.5 text-[10px] font-bold tracking-[0.6px] text-muted">
                    {pastEvents.length} concluded
                  </span>
                </div>
                {pastEvents.map((e) => (
                  <PastCard key={e.id} e={e} />
                ))}
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
