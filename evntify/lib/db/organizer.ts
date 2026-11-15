import { createClient } from "@/lib/supabase/server";

/* --------------------------------------------------------------------------
   Shared types used by both the Server Component page and the Client Component
   -------------------------------------------------------------------------- */

export type OrgEventStatus = "live" | "soldout" | "pending" | "returned" | "declined" | "archived" | "cancelled" | "completed";

export interface OrgEvent {
  id: string;          // UUID
  month: string;       // "OCT", "NOV", …
  day: string;         // "24", "05", …
  title: string;
  venue: string;
  time: string;
  status: OrgEventStatus;
  badgeLabel: string;
  registered: number;
  cap: number;
  capType: "RSVPs" | "Seats";
  org: string;
  tier: string;
  waitlistCount: number;
  rawStartsAt?: string;
  rawDate?: string;
  rawStartTime?: string;
  rawEndTime?: string;
  decisionNote?: string;
}

export interface OrgRosterStudent {
  id: string;
  initials: string;
  name: string;
  yearProgram: string;
  studentId: string;
  eventTrack: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInTime?: string;
}

export interface OrgProfile {
  id: string;
  fullName: string;
  orgName: string;
}

/* --------------------------------------------------------------------------
   getOrgProfile – logged-in organizer's name + organisation
   -------------------------------------------------------------------------- */
export async function getOrgProfile(): Promise<OrgProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("profiles")
    .select(`full_name, organization_members ( organizations ( name ) )`)
    .eq("id", user.id)
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgName = (data as any).organization_members?.[0]?.organizations?.name ?? "My Organisation";

  return {
    id: user.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fullName: (data as any).full_name ?? "Organizer",
    orgName,
  };
}

/* --------------------------------------------------------------------------
   getOrgEvents – events owned by the logged-in organiser's organisation
   -------------------------------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEventRow(row: any, stats: Record<string, { registered_count: number; waitlist_count: number }> = {}): OrgEvent {
  const starts = row.starts_at ? new Date(row.starts_at) : null;

  // Use Asia/Manila timezone so month/day are correct for PH users even when
  // the server runs in UTC (e.g. 2026-11-01T01:00Z → Nov 1 in Manila, Oct 31 in UTC).
  let month = "TBD";
  let day = "--";
  if (starts) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "2-digit",
    }).formatToParts(starts);
    month = (parts.find((p) => p.type === "month")?.value ?? "").toUpperCase().slice(0, 3);
    day = parts.find((p) => p.type === "day")?.value ?? "--";
  }

  const totalCap = Number(row.total_capacity ?? 0);
  const s = stats[row.id] ?? { registered_count: 0, waitlist_count: 0 };
  const registeredCount = Number(s.registered_count ?? 0);

  const dbStatus: string = row.approval ?? row.approval_status ?? "pending";
  const eventStatus: string = row.status ?? "open";
  let status: OrgEventStatus = "pending";

  if (eventStatus === "cancelled") {
    status = "cancelled";
  } else if (eventStatus === "completed") {
    status = "completed";
  } else if (dbStatus === "approved") {
    status = registeredCount >= totalCap && totalCap > 0 ? "soldout" : "live";
  } else if (dbStatus === "returned") {
    status = "returned";
  } else if (dbStatus === "declined") {
    status = "declined";
  } else if (dbStatus === "archived") {
    status = "archived";
  }

  const badgeMap: Record<OrgEventStatus, string> = {
    live: "Live • Approved",
    soldout: "Sold Out • Full",
    pending: "Pending SAO Clearance",
    returned: "Returned for Edits",
    declined: "Declined",
    archived: "Archived",
    cancelled: "Cancelled",
    completed: "Completed",
  };

  const rawDate = starts ? starts.toISOString().split("T")[0] : "";
  const rawStartTime = starts
    ? starts.toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour12: false, hour: "2-digit", minute: "2-digit" })
    : "";
  const rawEndTime = row.ends_at
    ? new Date(row.ends_at).toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour12: false, hour: "2-digit", minute: "2-digit" })
    : "";

  return {
    id: row.id,
    month,
    day,
    title: row.title ?? "Untitled",
    venue: row.venues?.name ?? row.venue_note ?? "TBD",
    time: starts
      ? starts.toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit" })
      : "TBD",
    status,
    badgeLabel: badgeMap[status] ?? "Pending",
    registered: registeredCount,
    cap: totalCap,
    capType: "RSVPs",
    org: row.organizations?.name ?? "—",
    tier: row.access_tier ?? "Free RSVP",
    waitlistCount: Number(s.waitlist_count ?? 0),
    rawStartsAt: row.starts_at ?? undefined,
    rawDate,
    rawStartTime,
    rawEndTime,
    decisionNote: row.event_approvals?.[0]?.decision_note ?? undefined,
  };
}

export async function getOrgEvents(): Promise<OrgEvent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Find the organiser's organisation ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: memberData } = await (supabase as any)
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!memberData) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgId = (memberData as any).organization_id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("events")
    .select(`
      id, title, starts_at, ends_at, approval, status, total_capacity, access_tier,
      venues ( name ),
      organizations ( name ),
      event_approvals ( decision_note, decided_at, stage )
    `)
    .eq("organization_id", orgId)
    .order("starts_at", { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) return [];

  // Fetch live stats from event_stats view
  const eventIds = ((data ?? []) as Array<{ id: string }>).map((e) => e.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: statsData } = await (supabase as any)
    .from("event_stats")
    .select("event_id, registered_count, waitlist_count")
    .in("event_id", eventIds);

  const statsMap: Record<string, { registered_count: number; waitlist_count: number }> = {};
  if (statsData) {
    ((statsData ?? []) as Array<{ event_id: string; registered_count: number | null; waitlist_count: number | null }>).forEach((s) => {
      statsMap[s.event_id] = {
        registered_count: Number(s.registered_count ?? 0),
        waitlist_count: Number(s.waitlist_count ?? 0),
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => mapEventRow(row, statsMap));
}

/* --------------------------------------------------------------------------
   getOrgRoster – registrations for a specific event (or the most recent one)
   -------------------------------------------------------------------------- */
export async function getOrgRoster(eventId?: string): Promise<OrgRosterStudent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // If eventId is provided, verify caller owns the event (or is admin)
  if (eventId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: owns } = await (supabase.rpc as any)("user_owns_event", { p_event: eventId });
    if (!owns) return [];
  }

  // If no eventId, pick the organiser's most recent approved event
  let resolvedEventId = eventId;
  if (!resolvedEventId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberData } = await (supabase as any)
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (!memberData) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: evData } = await (supabase as any)
      .from("events")
      .select("id")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("organization_id", (memberData as any).organization_id)
      .eq("approval", "approved")
      .order("starts_at", { ascending: false })
      .limit(1)
      .single();
    if (!evData) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolvedEventId = (evData as any).id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("registrations")
    .select(`
      id, ticket_code, status, registered_at, student_number,
      events ( category ),
      profiles ( full_name, college_id, colleges ( name ) ),
      check_ins ( checked_in_at )
    `)
    .eq("event_id", resolvedEventId)
    .neq("status", "cancelled")
    .order("registered_at", { ascending: true })
    .limit(100);

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row): OrgRosterStudent => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = row.profiles as any;
    const name: string = profile?.full_name ?? "Unknown";
    const initials = name
      .split(" ")
      .slice(0, 2)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase();
    const college: string = profile?.colleges?.name ?? "Unknown";
    // check_ins has a 1-to-1 unique relationship with registrations; PostgREST returns object or array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkin = Array.isArray(row.check_ins) ? (row.check_ins as any[])[0] : row.check_ins;
    const checkedInAt: string | undefined = checkin?.checked_in_at;

    return {
      id: row.id,
      initials,
      name,
      yearProgram: college,
      studentId: row.student_number ?? row.id,
      eventTrack: row.events?.category ?? "General",
      registeredAt: row.registered_at
        ? new Date(row.registered_at).toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
      checkedIn: !!checkin,
      checkedInTime: checkedInAt
        ? new Date(checkedInAt).toLocaleTimeString("en-US", {
            timeZone: "Asia/Manila",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    };
  });
}

