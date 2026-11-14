export type Tone = "blue" | "red" | "amber" | "green";
export type Decision = "pending" | "returned" | "approved" | "declined";

export interface Proposal {
  id: string;
  dept: string;
  tone: Tone;
  submitted: string;
  stage: string;
  stageTone: Tone;
  title: string;
  org: string;
  when: string;
  date: string;
  venue: string;
  venueNote: string;
  attendance: string;
  docs: string;
  check: string;
  checkTone: Tone;
  risk: string;
  seatsTotal: number;
  seatsExpected: number;
  capacityNote: string;
  brief: string;
  endorsements: string[];
  submittedBy: string;
  updated: string;
  banner: string;
  status: Decision;
  contact: string;
  contactEmail: string;
  clearance: string;
  clearanceNote: string;
  documents: { name: string; meta: string }[];
}

export const TONES: Record<Tone, { bg: string; fg: string; stripe: string }> = {
  blue: { bg: "rgba(0,80,212,.1)", fg: "#0050D4", stripe: "#0050D4" },
  red: { bg: "rgba(225,29,72,.1)", fg: "#B80035", stripe: "#8B263E" },
  amber: { bg: "#FEF3C7", fg: "#92400E", stripe: "#F59E0B" },
  green: { bg: "#D1FAE5", fg: "#065F46", stripe: "#059669" },
};

export type EventDirStatus = "ongoing" | "upcoming" | "scheduled" | "completed" | "suspended";

export interface EventItem {
  id: string;
  dept: string;
  title: string;
  blurb: string;
  status: EventDirStatus;
  org: string;
  date: string;
  venue: string;
  registered: number;
  capacity: number;
  people: string[];
  accent: string;
  banner: string;
  facilities: [string, string, string, string];
}

export const STATUS_LABEL: Record<EventDirStatus, string> = {
  ongoing: "Ongoing Now",
  upcoming: "Upcoming",
  scheduled: "Scheduled",
  completed: "Completed",
  suspended: "Suspended",
};

export const STATUS_COLOR: Record<EventDirStatus, string> = {
  ongoing: "#8B263E",
  upcoming: "#0050D4",
  scheduled: "#565E74",
  completed: "#D5E3FD",
  suspended: "#F59E0B",
};

export const pct = (e: { registered: number; capacity: number } | number, cap?: number) => {
  if (typeof e === "number") {
    const c = cap ?? 1;
    return c <= 0 ? 0 : Math.round((e / c) * 100);
  }
  return e.capacity <= 0 ? 0 : Math.round((e.registered / e.capacity) * 100);
};

export function capacityTone(p: number) {
  if (p >= 95) return { bar: "#E11D48", text: "#E11D48", label: "Full" };
  if (p >= 85) return { bar: "#F59E0B", text: "#D97706", label: "Near capacity" };
  return { bar: "#10B981", text: "#059669", label: "Registered" };
}

export const DEPARTMENTS = [
  "All Departments",
  "Engineering",
  "Business",
  "Architecture & Fine Arts",
  "Arts & Sciences",
  "Interdisciplinary",
] as const;
