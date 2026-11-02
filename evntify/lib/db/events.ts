import { createClient } from "@/lib/supabase/server";
import type { EventDetail, FeaturedEvent, CampusEvent } from "@/types/events";

// ── Types ─────────────────────────────────────────────────────────────────────

type StatsMap = Record<string, { registered_count: number; waitlisted_count: number }>;

// ── Internal helpers ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEventDetail(row: any, stats: StatsMap = {}): EventDetail {
  const s = stats[row.id] ?? { registered_count: 0, waitlisted_count: 0 };
  const registered = s.registered_count;
  const capacity = row.total_capacity ?? 0;
  const seatsLeft = Math.max(0, capacity - registered);

  const features = (row.event_features ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((f: any) => ({
      title: f.title,
      body: f.body ?? "",
      iconType: (f.icon_type ?? "maroon") as "maroon" | "green" | "amber",
    }));

  const startsAt = row.starts_at ? new Date(row.starts_at) : null;
  const dateStr = startsAt
    ? startsAt.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";
  const timeStr = startsAt
    ? startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    : "";

  const org = row.organizations;
  const venue = row.venues;
  const college = row.colleges;

  return {
    id: row.slug,
    code: row.code ?? row.slug.toUpperCase().slice(0, 10),
    title: row.title,
    org: org?.name ?? college?.name ?? "",
    orgDept: org?.dept_label ?? college?.name ?? "",
    orgInitials: org?.initials ?? college?.code ?? "",
    orgEst: org?.est_year ? `EST. '${String(org.est_year).slice(-2)}` : undefined,
    breadcrumbDept: college?.name ?? "",
    statusBadge: `VERIFIED ${row.category?.toUpperCase() ?? "EVENT"}`,
    briefingEyebrow: "BRIEFING • OBJECTIVES",
    overviewTitle: "Event Overview & Scope",
    category: row.category ?? "",
    date: dateStr,
    time: timeStr,
    doorsOpen: "Doors open 30 minutes before start",
    venue: venue?.name ?? "",
    venueDetails: venue?.details ?? "",
    summary: row.summary ?? "",
    description: row.description ?? [],
    features,
    totalCapacity: capacity,
    registeredCount: registered,
    seatsLeft,
    registrationDeadline: row.registration_deadline ?? "",
    bannerColor: row.banner_color ?? "#1e2022",
    status:
      row.status === "open"
        ? seatsLeft === 0
          ? "FULL"
          : seatsLeft <= 10
            ? "LIMITED"
            : "OPEN"
        : row.status === "concluded"
          ? "COMPLETED"
          : "OPEN",
    coordinator: {
      name: row.coordinator_name ?? "",
      role: org?.dept_label ? `${org.dept_label} Coordinator` : "Event Coordinator",
      email: row.coordinator_email ?? "",
      phone: row.coordinator_phone ?? "",
      initials: (row.coordinator_name ?? "EC")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    },
    href: `/events/${row.slug}`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCampusEvent(row: any, stats: StatsMap = {}): CampusEvent {
  const s = stats[row.id] ?? { registered_count: 0, waitlisted_count: 0 };
  const registered = s.registered_count;
  const capacity = row.total_capacity ?? 0;
  const seatsLeft = Math.max(0, capacity - registered);

  const startsAt = row.starts_at ? new Date(row.starts_at) : null;
  const dateStr = startsAt
    ? startsAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";
  const venueShort = row.venues?.name ?? "";

  return {
    id: row.slug,
    code: row.code ?? "",
    org: row.organizations?.initials ?? row.organizations?.short_name ?? "",
    title: row.title,
    date: startsAt ? `${dateStr} · ${venueShort}` : venueShort,
    venue: venueShort,
    seatsLeft,
    bannerColor: row.banner_color ?? "#1e2022",
    href: `/events/${row.slug}`,
    department: (row.colleges?.slug ?? undefined) as
      | "eng"
      | "sci"
      | "biz"
      | "art"
      | undefined,
    tag: row.category ?? undefined,
    startsAt: row.starts_at ?? undefined,
    createdAt: row.created_at ?? undefined,
    status: row.status === "concluded" ? "concluded" : "open",
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

const EVENT_SELECT = `
  id, slug, code, title, summary, description, category,
  starts_at, ends_at, total_capacity, status, approval,
  is_featured, featured_rank, registration_deadline,
  coordinator_name, coordinator_email, coordinator_phone,
  banner_color, created_at,
  organizations ( id, name, short_name, initials, dept_label, est_year ),
  colleges ( id, slug, code, name, short_name ),
  venues ( id, name, details, capacity ),
  event_features ( id, title, body, icon_type, sort_order )
`;

/**
 * Fetch seat counts from the event_stats VIEW for a batch of event IDs.
 *
 * event_stats is a SQL VIEW — PostgREST cannot resolve it as an embedded join
 * (no FK metadata on views). We query it directly via .from() instead.
 *
 * The view must have a SELECT policy, e.g.:
 *   create policy "public read stats" on event_stats for select using (true);
 * If it is missing, this will silently return {} and seatsLeft defaults to total_capacity.
 */
async function fetchStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventIds: string[]
): Promise<StatsMap> {
  if (eventIds.length === 0) return {};
  const { data, error } = await supabase
    .from("event_stats" as never)
    .select("event_id, registered_count, waitlisted_count")
    .in("event_id" as never, eventIds as never);
  if (error) {
    console.warn("[fetchStats] event_stats query failed:", error.message);
    return {};
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.fromEntries((data as any[]).map((r) => [r.event_id, r])) as StatsMap;
}

export async function getEvents(): Promise<CampusEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("approval", "approved")
    .neq("status", "draft")
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[getEvents]", error.message);
    return [];
  }
  const rows = data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids = rows.map((r: any) => r.id as string);
  const stats = await fetchStats(supabase, ids);
  return rows.map((r) => rowToCampusEvent(r, stats));
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("slug", slug)
    .eq("approval", "approved")
    .single();

  if (error || !data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats = await fetchStats(supabase, [(data as any).id as string]);
  return rowToEventDetail(data, stats);
}

export async function getFeaturedEvents(): Promise<FeaturedEvent[]> {
  const supabase = await createClient();

  // Primary: explicitly featured events
  const { data: featured } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("approval", "approved")
    .eq("is_featured", true)
    .order("featured_rank", { ascending: true })
    .limit(5);

  if (featured && featured.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = featured.map((r: any) => r.id as string);
    const stats = await fetchStats(supabase, ids);
    return featured.map((row) => {
      const detail = rowToEventDetail(row, stats);
      return {
        id: detail.id,
        org: detail.orgDept,
        title: detail.title,
        date: detail.date,
        time: detail.time,
        venue: detail.venue,
        summary: detail.summary,
        seatsLeft: detail.seatsLeft,
        href: detail.href,
      };
    });
  }

  // Fallback: next 2 upcoming approved events
  const { data: fallback } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("approval", "approved")
    .eq("status", "open")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(2);

  const fallbackRows = fallback ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids = fallbackRows.map((r: any) => r.id as string);
  const stats = await fetchStats(supabase, ids);

  return fallbackRows.map((row) => {
    const detail = rowToEventDetail(row, stats);
    return {
      id: detail.id,
      org: detail.orgDept,
      title: detail.title,
      date: detail.date,
      time: detail.time,
      venue: detail.venue,
      summary: detail.summary,
      seatsLeft: detail.seatsLeft,
      href: detail.href,
    };
  });
}

export async function getAllEventSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("slug")
    .eq("approval", "approved");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((r) => r.slug as string);
}
