import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  totalStudents: number;
  totalOrganizations: number;
  scheduledEvents: number; // next 30 days
  pendingApprovals: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [studentsRes, orgsRes, eventsRes, pendingRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    supabase
      .from("organizations")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("approval", "approved")
      .gte("starts_at", now.toISOString())
      .lte("starts_at", in30Days.toISOString()),
    supabase
      .from("event_approvals")
      .select("id", { count: "exact", head: true })
      .or("decision.is.null,decision.eq.pending"),
  ]);

  return {
    totalStudents: studentsRes.count ?? 0,
    totalOrganizations: orgsRes.count ?? 0,
    scheduledEvents: eventsRes.count ?? 0,
    pendingApprovals: pendingRes.count ?? 0,
  };
}

export type ApprovalItem = {
  id: string;
  eventId: string;
  eventTitle: string;
  org: string;
  dept: string;
  venue: string;
  venueNote: string;
  date: string;
  when: string;
  submittedAt: string;
  submittedBy: string;
  contactEmail: string;
  decision: "pending" | "approved" | "rejected" | "returned" | "declined" | null;
  decidedAt: string | null;
  notes: string | null;
  seatsTotal: number;
  seatsExpected: number;
  category: string;
  brief: string;
  safetyCheck: string;
  capacityNote: string;
  risk: string;
  documents: { name: string; meta: string }[];
  endorsements: string[];
};

export async function getApprovals(): Promise<ApprovalItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_approvals")
    .select(`
      id, submitted_at, decision, decided_at, decision_note, brief, capacity_note, safety_check, seats_expected, risk,
      events (
        id, title, category, total_capacity, starts_at, ends_at, description, summary,
        organizations ( name, dept_label ),
        colleges ( name ),
        venues ( name, details )
      ),
      event_documents ( kind, label, file_url ),
      profiles!submitted_by ( full_name, email )
    `)
    .order("submitted_at", { ascending: false });

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => {
    const ev = row.events;
    const startsAt = ev?.starts_at ? new Date(ev.starts_at) : null;
    const endsAt = ev?.ends_at ? new Date(ev.ends_at) : null;
    const dateStr = startsAt
      ? startsAt.toLocaleDateString("en-US", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric" })
      : "TBD";
    const startTimeStr = startsAt
      ? startsAt.toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" })
      : "";
    const endTimeStr = endsAt
      ? endsAt.toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" })
      : "";
    const whenStr = startTimeStr
      ? `${dateStr} · ${startTimeStr}${endTimeStr ? ` – ${endTimeStr}` : ""}`
      : dateStr;

    const desc = Array.isArray(ev?.description)
      ? ev.description.join(" ")
      : ev?.description || ev?.summary || row.brief || "";

    const docsList = Array.isArray(row.event_documents) ? row.event_documents : [];
    const documents = docsList
      .filter((d: { kind?: string }) => d.kind === "document")
      .map((d: { label?: string; file_url?: string }) => ({
        name: d.label ?? "Document",
        meta: d.file_url ?? "Attached file",
      }));
    const endorsements = docsList
      .filter((d: { kind?: string }) => d.kind === "endorsement")
      .map((d: { label?: string }) => d.label ?? "Endorsement");

    const rawRisk = row.risk ?? "standard";
    const formattedRisk = rawRisk.charAt(0).toUpperCase() + rawRisk.slice(1);

    return {
      id: row.id,
      eventId: ev?.id ?? "",
      eventTitle: ev?.title ?? "Untitled Event",
      org: ev?.organizations?.name ?? ev?.colleges?.name ?? "Unknown Org",
      dept: ev?.colleges?.name ?? ev?.organizations?.dept_label ?? "",
      venue: ev?.venues?.name ?? "",
      venueNote: ev?.venues?.details ?? "",
      date: dateStr,
      when: whenStr,
      submittedAt: row.submitted_at,
      submittedBy: row.profiles?.full_name ?? row.profiles?.email ?? "Unknown",
      contactEmail: row.profiles?.email ?? "",
      decision: row.decision ?? "pending",
      decidedAt: row.decided_at,
      notes: row.decision_note ?? null,
      seatsTotal: ev?.total_capacity ?? 0,
      seatsExpected: row.seats_expected || ev?.total_capacity || 0,
      category: ev?.category ?? "",
      brief: desc || `Category: ${ev?.category || "General"}`,
      safetyCheck: row.safety_check ?? "Not recorded",
      capacityNote: row.capacity_note ?? "",
      risk: formattedRisk,
      documents,
      endorsements,
    };
  });
}

export type EventDirectoryItem = {
  id: string;
  slug: string;
  title: string;
  org: string;
  dept: string;
  venue: string;
  date: string;
  registered: number;
  capacity: number;
  status: string;
  approval: string;
  category: string;
  bannerColor: string;
};

export async function getEventsDirectory(
  page = 1,
  pageSize = 10
): Promise<{ items: EventDirectoryItem[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("events")
    .select(
      `id, slug, title, category, total_capacity, status, approval, starts_at, banner_color,
      organizations ( name ),
      colleges ( name ),
      venues ( name )`,
      { count: "exact" }
    )
    .order("starts_at", { ascending: false })
    .range(from, to);

  if (error || !data || data.length === 0) return { items: [], total: 0 };

  const eventIds = ((data ?? []) as Array<{ id: string }>).map((e) => e.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: statsData } = await (supabase as any)
    .from("event_stats")
    .select("event_id, registered_count")
    .in("event_id", eventIds);

  const regCounts: Record<string, number> = {};
  if (statsData) {
    ((statsData ?? []) as Array<{ event_id: string; registered_count: number | null }>).forEach((s) => {
      regCounts[s.event_id] = Number(s.registered_count ?? 0);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: EventDirectoryItem[] = (data as any[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    org: row.organizations?.name ?? row.colleges?.name ?? "",
    dept: row.colleges?.name ?? "",
    venue: row.venues?.name ?? "",
    date: row.starts_at
      ? new Date(row.starts_at).toLocaleDateString("en-US", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : "TBD",
    registered: regCounts[row.id] ?? 0,
    capacity: row.total_capacity ?? 0,
    status: row.status,
    approval: row.approval,
    category: row.category ?? "",
    bannerColor: row.banner_color ?? "#1e2022",
  }));

  return { items, total: count ?? 0 };
}

export type OrganizerItem = {
  id: string;
  name: string;
  role: string;
  org: string;
  college: string;
  email: string;
  pendingProposals: number;
  activeEvents: number;
};

export async function getOrganizers(): Promise<OrganizerItem[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select(`
      id, full_name, email, student_number,
      colleges ( name ),
      organization_members ( position, organization_id, organizations ( name ) )
    `)
    .eq("role", "organizer");

  if (error || !data) return [];

  // Collect all org IDs so we can batch-query pending + active counts
  const orgIds = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any[]).forEach((p) => {
    const members = Array.isArray(p.organization_members) ? p.organization_members : [];
    members.forEach((m: { organization_id?: string }) => {
      if (m.organization_id) orgIds.add(m.organization_id);
    });
  });

  // Fetch pending approval counts per org
  const pendingByOrg: Record<string, number> = {};
  const activeByOrg: Record<string, number> = {};
  if (orgIds.size > 0) {
    const ids = Array.from(orgIds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pendingRows } = await (supabase as any)
      .from("event_approvals")
      .select("events!inner(organization_id)")
      .eq("decision", "pending")
      .in("events.organization_id", ids);
    if (pendingRows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pendingRows as any[]).forEach((r) => {
        const oid = r.events?.organization_id as string | undefined;
        if (oid) pendingByOrg[oid] = (pendingByOrg[oid] ?? 0) + 1;
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: activeRows } = await (supabase as any)
      .from("events")
      .select("organization_id")
      .in("organization_id", ids)
      .eq("approval", "approved")
      .eq("status", "open");
    if (activeRows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (activeRows as any[]).forEach((r) => {
        const oid = r.organization_id as string;
        activeByOrg[oid] = (activeByOrg[oid] ?? 0) + 1;
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((p) => {
    const member = Array.isArray(p.organization_members) ? p.organization_members[0] : null;
    const orgId = member?.organization_id as string | undefined;
    return {
      id: p.id,
      name: p.full_name ?? "Unknown",
      role: member?.position ?? "Member",
      org: member?.organizations?.name ?? "Unaffiliated",
      college: p.colleges?.name ?? "Unknown",
      email: p.email ?? (p.student_number ? `${p.student_number}@ue.edu.ph` : ""),
      pendingProposals: orgId ? (pendingByOrg[orgId] ?? 0) : 0,
      activeEvents: orgId ? (activeByOrg[orgId] ?? 0) : 0,
    };
  });
}

export type FeaturedEventItem = {
  title: string;
  starts_at: string | null;
  venue: string;
  status: string;
};

export async function getFeaturedEvent(): Promise<FeaturedEventItem | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("events")
    .select(`title, starts_at, status, venues ( name )`)
    .eq("approval", "approved")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    title: data.title ?? "Untitled Event",
    starts_at: data.starts_at ?? null,
    venue: data.venues?.name ?? "TBD",
    status: data.status ?? "scheduled",
  };
}

export type UpcomingEventItem = {
  id: string;
  title: string;
  starts_at: string | null;
  venue: string;
  category: string | null;
};

export async function getUpcomingEvents(limit = 4): Promise<UpcomingEventItem[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("events")
    .select(`id, title, starts_at, category, venues ( name )`)
    .eq("approval", "approved")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => ({
    id: row.id,
    title: row.title ?? "Untitled",
    starts_at: row.starts_at ?? null,
    venue: row.venues?.name ?? "TBD",
    category: row.category ?? null,
  }));
}

export async function getAdminProfile(): Promise<{ name: string; role: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { name: "Admin Office", role: "Student Affairs" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return {
    name: ((data as unknown) as { full_name?: string | null } | null)?.full_name ?? "Admin Office",
    role: "Office of Student Affairs",
  };
}

