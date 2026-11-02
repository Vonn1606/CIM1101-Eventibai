import { createClient } from "@/lib/supabase/server";

/* --------------------------------------------------------------------------
   Shared types used by both the Server Component page and the Client Component
   -------------------------------------------------------------------------- */

export type OrgEventStatus = "live" | "soldout" | "pending" | "archived";

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
    .single();

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

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEventRow(row: any): OrgEvent {
  const starts = row.starts_at ? new Date(row.starts_at) : null;
  const month = starts ? MONTHS[starts.getMonth()] : "TBD";
  const day = starts ? String(starts.getDate()).padStart(2, "0") : "--";

  // derive capType from approval_status / capacity type — default RSVPs
  const dbStatus: string = row.approval ?? row.approval_status ?? "pending";
  let status: OrgEventStatus = "pending";
  if (dbStatus === "approved") {
    status = row.registered_count >= row.capacity ? "soldout" : "live";
  } else if (dbStatus === "archived") {
    status = "archived";
  }

  const badgeMap: Record<OrgEventStatus, string> = {
    live: "Live • Approved",
    soldout: "Sold Out • Full",
    pending: "Pending SAO Clearance",
    archived: "Archived",
  };

  return {
    id: row.id,
    month,
    day,
    title: row.title ?? "Untitled",
    venue: row.venues?.name ?? row.venue_note ?? "TBD",
    time: starts
      ? starts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "TBD",
    status,
    badgeLabel: badgeMap[status],
    registered: row.registered_count ?? 0,
    cap: row.capacity ?? 0,
    capType: "RSVPs",
    org: row.organizations?.name ?? "—",
    tier: "Free RSVP",
    waitlistCount: 0,
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
    .single();

  if (!memberData) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgId = (memberData as any).organization_id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("events")
    .select(`
      id, title, starts_at, approval, capacity,
      registered_count,
      venues ( name ),
      organizations ( name )
    `)
    .eq("organization_id", orgId)
    .order("starts_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(mapEventRow);
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

  // If no eventId, pick the organiser's most recent approved event
  let resolvedEventId = eventId;
  if (!resolvedEventId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberData } = await (supabase as any)
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkin = Array.isArray(row.check_ins) ? (row.check_ins as any[])[0] : null;
    const checkedInAt: string | undefined = checkin?.checked_in_at;

    return {
      id: row.id,
      initials,
      name,
      yearProgram: college,
      studentId: row.student_number ?? row.id,
      eventTrack: "General",
      registeredAt: row.registered_at
        ? new Date(row.registered_at).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
      checkedIn: !!checkin,
      checkedInTime: checkedInAt
        ? new Date(checkedInAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    };
  });
}

