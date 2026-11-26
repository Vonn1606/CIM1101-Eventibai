import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyRegistrations } from "@/app/actions/registration";
import type { UpcomingEvent, PastEvent } from "@/app/actions/registration";
import { getUserOrganizerApplication } from "@/app/actions/organizer-application";
import { getCalendarEvents } from "@/lib/db/stats";
import { getMyOrganizations, getActiveOrgId } from "@/lib/db/active-org";
import ApplyOrganizerSection from "@/component/user-profile/ApplyOrganizerSection";
import OrganizationSwitcher from "@/component/user-profile/OrganizationSwitcher";
import Header from "@/component/user-profile/Header";
import SiteFooter from "@/component/layout/site-footer";
import WelcomeBar from "@/component/user-profile/WelcomeBar";
import CalendarSidebar from "@/component/user-profile/CalendarSidebar";
import type { SelectedDayEventItem } from "@/component/user-profile/SelectedDayPreview";
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

/** Get year, month (0-based), day in Asia/Manila */
function getManilaDateParts(isoDate: string): { year: number; month: number; day: number } {
  const d = new Date(isoDate);
  const year = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric" }).format(d));
  const month = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", month: "numeric" }).format(d)) - 1;
  const day = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", day: "numeric" }).format(d));
  return { year, month, day };
}

/** Build a calendar object for the given month */
function buildCalendar(
  year: number,
  month: number, // 0-indexed
  registrations: { event: { starts_at: string | null } }[],
  monthEvents: { id: string; starts_at: string }[],
  registeredEventIds: Set<string>
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

  // Days that have a registration in this month (Manila-tz based)
  const registered = registrations
    .map((r) => {
      if (!r.event.starts_at) return null;
      const parts = getManilaDateParts(r.event.starts_at);
      if (parts.year === year && parts.month === month) return parts.day;
      return null;
    })
    .filter((d): d is number => d !== null);

  const registeredSet = new Set(registered);

  // Open events the user has not registered for (Manila-tz based)
  const openEvents = monthEvents
    .filter((e) => !registeredEventIds.has(e.id))
    .map((e) => {
      const parts = getManilaDateParts(e.starts_at);
      if (parts.year === year && parts.month === month && !registeredSet.has(parts.day)) {
        return parts.day;
      }
      return null;
    })
    .filter((d): d is number => d !== null);

  return {
    monthLabel,
    prevTail,
    days: daysInMonth,
    featured: 0,
    registered: [...registeredSet],
    openEvents: [...new Set(openEvents)],
  };
}

interface MyEventsPageProps {
  searchParams?: Promise<{ m?: string }>;
}

export default async function MyEventsPage({ searchParams }: MyEventsPageProps) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/my-events");
  }

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

  const [
    { upcoming: upcomingRegs, past: pastRegs },
    userApp,
    userProfileRes,
    monthEvents,
    userOrgs,
    activeOrgId,
    allOrgsRes,
  ] = await Promise.all([
    getMyRegistrations(user.id),
    getUserOrganizerApplication(),
    supabase.from("profiles").select("role, college_id, colleges ( name )").eq("id", user.id).maybeSingle(),
    getCalendarEvents(manilaYear, manilaMonth),
    getMyOrganizations(supabase, user.id),
    getActiveOrgId(supabase, user.id),
    supabase.from("organizations").select("id, name, short_name").order("name"),
  ]);

  const allOrganizations = (allOrgsRes.data ?? []).map((o) => ({
    id: o.id,
    name: o.name,
    short_name: o.short_name,
  }));

  const userRole = userProfileRes.data?.role ?? "student";
  const userCollegeName =
    (userProfileRes.data as { colleges?: { name?: string | null } | null } | null)?.colleges?.name ?? "";

  // Map MyRegistration → UpcomingEvent
  const upcomingEvents: UpcomingEvent[] = upcomingRegs.map((r) => {
    const isWaitlisted = r.status === "waitlisted";
    return {
      id: r.id,
      headerLabel: isWaitlisted ? "Waitlisted in queue" : "Registered event",
      headerColor: isWaitlisted ? "bg-amber-700" : "bg-charcoal",
      featured: false,
      date: formatDate(r.event.starts_at),
      title: r.event.title,
      description: r.event.category ?? "",
      qrCode: isWaitlisted ? "" : r.ticket_code,
      venue: r.event.venue,
      meta: formatTime(r.event.starts_at),
      status: r.status,
      isWaitlisted,
    };
  });

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

  const allRegs = [...upcomingRegs, ...pastRegs];
  const registeredEventIds = new Set(
    allRegs.map((r) => (r.event as { id?: string })?.id).filter(Boolean) as string[]
  );

  // Build calendar for the active month (in Asia/Manila)
  const calendarData = buildCalendar(
    manilaYear,
    manilaMonth,
    allRegs,
    monthEvents,
    registeredEventIds
  );

  // Build a map of day-of-month → event info list for SelectedDayPreview
  const dayEvents: Record<number, SelectedDayEventItem[]> = {};

  // First populate registered events
  for (const r of allRegs) {
    if (!r.event.starts_at) continue;
    const parts = getManilaDateParts(r.event.starts_at);
    if (parts.year === manilaYear && parts.month === manilaMonth) {
      if (!dayEvents[parts.day]) {
        dayEvents[parts.day] = [];
      }
      dayEvents[parts.day].push({
        date: formatDate(r.event.starts_at),
        title: r.event.title,
        time: formatTime(r.event.starts_at),
        venue: r.event.venue ?? "",
        ticketCode: (r as { ticket_code?: string }).ticket_code ?? "",
        isRegistered: true,
        slug: (r.event as { slug?: string }).slug ?? "",
      });
    }
  }

  // Then populate open events for days (avoiding duplicate entries for the same event)
  for (const ev of monthEvents) {
    if (!ev.starts_at) continue;
    const parts = getManilaDateParts(ev.starts_at);
    if (parts.year === manilaYear && parts.month === manilaMonth) {
      if (!dayEvents[parts.day]) {
        dayEvents[parts.day] = [];
      }
      const alreadyHas = dayEvents[parts.day].some((item) => item.slug === ev.slug || item.title === ev.title);
      if (!alreadyHas) {
        dayEvents[parts.day].push({
          date: formatDate(ev.starts_at),
          title: ev.title,
          time: formatTime(ev.starts_at),
          venue: ev.venue ?? "",
          isRegistered: false,
          slug: ev.slug,
        });
      }
    }
  }

  const prevDate = new Date(manilaYear, manilaMonth - 1, 1);
  const nextDate = new Date(manilaYear, manilaMonth + 1, 1);
  const prevHref = `/my-events?m=${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const nextHref = `/my-events?m=${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
  const todayHref = "/my-events";

  return (
    <>
      {/* Feature 2: Pass organizations + activeOrgId so Header can render
          the multi-org dropdown when the user belongs to more than one org. */}
      <Header organizations={userOrgs} activeOrgId={activeOrgId} />
      <main className="min-h-[576px] bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 lg:px-10 py-8">
          <WelcomeBar upcoming={upcomingEvents.length} past={pastEvents.length} />

          <OrganizationSwitcher organizations={userOrgs} activeOrgId={activeOrgId} />

          {userRole !== "admin" && (
            <ApplyOrganizerSection
              existingApplication={userApp}
              userRole={userRole}
              allOrganizations={allOrganizations}
              defaultCollege={userCollegeName}
            />
          )}

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,488px)_1fr]">
            <aside className="flex flex-col gap-5 lg:sticky lg:top-28">
              <CalendarSidebar
                monthLabel={calendarData.monthLabel}
                prevTail={calendarData.prevTail}
                days={calendarData.days}
                featured={calendarData.featured}
                registered={calendarData.registered}
                openEvents={calendarData.openEvents}
                prevHref={prevHref}
                nextHref={nextHref}
                todayHref={todayHref}
                dayEvents={dayEvents}
              />
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
      <SiteFooter />
    </>
  );
}
