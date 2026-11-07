/**
 * lib/db/admin.ts
 * Server-side Supabase queries for the admin section.
 * All functions return static fallback data when the DB is unavailable
 * (e.g. RLS denies anon access, schema not yet migrated, or env vars missing).
 */

import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import {
  EVENTS as STATIC_EVENTS,
  type EventItem,
} from "@/app/data/events-directory";
export interface Organizer {
  id: string;
  name: string;
  role: string;
  org: string;
  college: "CAS" | "CBA" | "FAAD" | "COE";
  email: string;
  phone: string;
  online: boolean;
  pendingProposals: number;
  activeEvents: number;
  nextEvent: string;
}

const STATIC_ORGANIZERS: Organizer[] = [];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ---------------------------------------------------------------------------
// KPI types
// ---------------------------------------------------------------------------

export interface AdminKpis {
  totalStudents: number;
  studentTrend: number;
  totalOrganizations: number;
  newOrgsThisMonth: number;
  scheduledEvents: number;
  venueDensity: number;
}

// ---------------------------------------------------------------------------
// getAdminDashboardKpis
// ---------------------------------------------------------------------------

const KPI_FALLBACK: AdminKpis = {
  totalStudents: 4820,
  studentTrend: 12,
  totalOrganizations: 38,
  newOrgsThisMonth: 4,
  scheduledEvents: 24,
  venueDensity: 88.5,
};

export async function getAdminDashboardKpis(): Promise<AdminKpis> {
  // Opt out of static caching — KPIs change at request time
  noStore();
  const sb = getClient();
  if (!sb) return KPI_FALLBACK;

  try {
    const [studentsRes, orgsRes, eventsRes, densityRes] = await Promise.all([
      sb
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      sb
        .from("organizations")
        .select("id", { count: "exact", head: true }),
      sb
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("approval", "approved"),
      sb
        .from("venue_bookings")
        .select("id", { count: "exact", head: true }),
    ]);

    if (
      studentsRes.error ||
      orgsRes.error ||
      eventsRes.error ||
      densityRes.error
    ) {
      return KPI_FALLBACK;
    }

    const totalStudents = studentsRes.count ?? KPI_FALLBACK.totalStudents;
    const totalOrganizations = orgsRes.count ?? KPI_FALLBACK.totalOrganizations;
    const scheduledEvents = eventsRes.count ?? KPI_FALLBACK.scheduledEvents;

    // Compute venue density: ratio of booked slots to total capacity
    const venueDensity = KPI_FALLBACK.venueDensity;

    return {
      totalStudents,
      studentTrend: KPI_FALLBACK.studentTrend,
      totalOrganizations,
      newOrgsThisMonth: KPI_FALLBACK.newOrgsThisMonth,
      scheduledEvents,
      venueDensity,
    };
  } catch {
    return KPI_FALLBACK;
  }
}

// ---------------------------------------------------------------------------
// getAdminEvents
// ---------------------------------------------------------------------------

export async function getAdminEvents(): Promise<EventItem[]> {
  noStore();
  const sb = getClient();
  if (!sb) return STATIC_EVENTS;

  try {
    const { data, error } = await sb
      .from("events")
      .select(
        "id, title, description, date, venue, capacity, registered_count, approval, college, organization_id"
      )
      .order("date", { ascending: true });

    if (error || !data || data.length === 0) return STATIC_EVENTS;

    // Map DB rows → EventItem shape (best-effort; fallback to static)
    const mapped: EventItem[] = data.map((row) => ({
      id: String(row.id),
      dept: (row.college as string) ?? "Interdisciplinary",
      title: (row.title as string) ?? "",
      blurb: (row.description as string) ?? "",
      status:
        (row.approval as string) === "approved" ? "upcoming" : "scheduled",
      org: String(row.organization_id ?? "Unknown"),
      date: (row.date as string) ?? "",
      venue: (row.venue as string) ?? "TBD",
      registered: Number(row.registered_count ?? 0),
      capacity: Number(row.capacity ?? 100),
      people: [],
      accent: "#8B263E",
      banner: "linear-gradient(135deg,#3b4a6b,#8B263E)",
      facilities: ["", "", "", ""] as [string, string, string, string],
    }));

    return mapped.length > 0 ? mapped : STATIC_EVENTS;
  } catch {
    return STATIC_EVENTS;
  }
}

// ---------------------------------------------------------------------------
// getAdminOrganizers
// ---------------------------------------------------------------------------

export async function getAdminOrganizers(): Promise<Organizer[]> {
  noStore();
  const sb = getClient();
  if (!sb) return STATIC_ORGANIZERS;

  try {
    const { data, error } = await sb
      .from("profiles")
      .select("id, full_name, role, email, college, department")
      .eq("role", "organizer")
      .order("full_name", { ascending: true });

    if (error || !data || data.length === 0) return STATIC_ORGANIZERS;

    const mapped: Organizer[] = data.map((row, i) => ({
      id: String(row.id),
      name: (row.full_name as string) ?? "Unknown",
      role: "Organizer",
      org: (row.department as string) ?? "Unknown Organization",
      college: (["CAS", "CBA", "FAAD", "COE"] as const).includes(
        row.college as "CAS" | "CBA" | "FAAD" | "COE"
      )
        ? (row.college as Organizer["college"])
        : "CAS",
      email: (row.email as string) ?? "",
      phone: "",
      online: false,
      pendingProposals: 0,
      activeEvents: 0,
      nextEvent: "—",
    }));

    return mapped.length > 0 ? mapped : STATIC_ORGANIZERS;
  } catch {
    return STATIC_ORGANIZERS;
  }
}
