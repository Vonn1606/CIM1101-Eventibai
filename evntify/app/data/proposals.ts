export type Tone = "blue" | "red" | "amber" | "green";
export type Decision = "pending" | "returned" | "approved" | "declined";

export interface Proposal {
  id: string;
  dept: string;
  tone: Tone;
  submitted: string;
  stage: string; // badge text, e.g. "Awaiting Review"
  stageTone: Tone;
  title: string;
  org: string;
  when: string;
  date: string;
  venue: string;
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
}

export const PROPOSALS: Proposal[] = [
  {
    id: "lits",
    dept: "Engineering",
    tone: "blue",
    submitted: "Submitted 2 days ago",
    stage: "Awaiting Review",
    stageTone: "amber",
    title: "LITS Tech Innovation Summit 2025",
    org: "LITS Student Council",
    when: "Nov 28, 2025 · 9 AM – 5 PM",
    date: "Nov 28, 2025 9:00 AM – 5:00 PM",
    venue: "Grand Hall, Level 2",
    attendance: "500 expected attendees",
    docs: "3 documents attached",
    check: "Safety checks passed",
    checkTone: "green",
    risk: "High risk",
    seatsTotal: 600,
    seatsExpected: 500,
    capacityNote:
      "Expected attendance is close to the hall's comfortable limit. Confirm overflow seating.",
    brief:
      "Annual showcase of autonomous vehicle prototypes, generative models, and student hardware exhibits. Involves high-voltage power conduits, demonstration booths, and external tech industry evaluators requiring visitor gate badges.",
    endorsements: ["Faculty adviser endorsement", "Dept. head sign-off"],
    submittedBy: "Submitted by LITS Council",
    updated: "Updated 2 days ago",
    banner: "linear-gradient(135deg,#233144,#8B263E)",
    status: "pending",
  },
  {
    id: "bcc",
    dept: "Business Admin",
    tone: "red",
    submitted: "Submitted 3 days ago",
    stage: "Under Review",
    stageTone: "blue",
    title: "Annual Business Case Challenge",
    org: "Business Guild",
    when: "Dec 05, 2025 · 8 AM – 6 PM",
    date: "Dec 05, 2025 8:00 AM – 6:00 PM",
    venue: "Lecture Hall B",
    attendance: "320 expected attendees",
    docs: "4 documents attached",
    check: "Budget verified",
    checkTone: "green",
    risk: "Standard",
    seatsTotal: 400,
    seatsExpected: 320,
    capacityNote: "Seating is within the hall limit.",
    brief:
      "Intercollegiate case competition with judges from partner firms. Includes sponsor booths, a catered lunch and a closing awards ceremony.",
    endorsements: [
      "Faculty adviser endorsement",
      "Finance office budget check",
    ],
    submittedBy: "Submitted by Business Guild",
    updated: "Updated yesterday",
    banner: "linear-gradient(135deg,#0d1c2f,#0050D4)",
    status: "pending",
  },
  {
    id: "sketchwalk",
    dept: "Architecture & Design",
    tone: "amber",
    submitted: "Submitted 4 days ago",
    stage: "Needs Attention",
    stageTone: "red",
    title: "Architectural Heritage Sketchwalk",
    org: "Architecture Society",
    when: "Dec 09, 2025 · 7 AM – 12 PM",
    date: "Dec 09, 2025 7:00 AM – 12:00 PM",
    venue: "Heritage Quarter (off campus)",
    attendance: "90 expected attendees",
    docs: "2 documents attached",
    check: "Fire clearance pending",
    checkTone: "amber",
    risk: "Off-campus",
    seatsTotal: 120,
    seatsExpected: 90,
    capacityNote:
      "Off-campus route requires a marshal for every 15 participants.",
    brief:
      "Guided sketching walk through the heritage quarter, ending with a pop-up exhibit. Needs a road-crossing marshal plan and a permit from the city office.",
    endorsements: ["Faculty adviser endorsement"],
    submittedBy: "Submitted by Architecture Society",
    updated: "Updated 3 days ago",
    banner: "linear-gradient(135deg,#5c3f40,#F59E0B)",
    status: "pending",
  },
  {
    id: "debate",
    dept: "Arts & Sciences",
    tone: "green",
    submitted: "Submitted 5 days ago",
    stage: "Ready for Sign-off",
    stageTone: "green",
    title: "Inter-Collegiate Debate Open",
    org: "Debate Society",
    when: "Dec 12, 2025 · 9 AM – 4 PM",
    date: "Dec 12, 2025 9:00 AM – 4:00 PM",
    venue: "Science Auditorium",
    attendance: "180 expected attendees",
    docs: "3 documents attached",
    check: "All endorsements received",
    checkTone: "green",
    risk: "Low risk",
    seatsTotal: 250,
    seatsExpected: 180,
    capacityNote: "Seating is within the hall limit.",
    brief:
      "Two-day parliamentary debate with teams from six colleges. Uses standard AV, timekeeping stations and a public gallery.",
    endorsements: ["Faculty adviser endorsement", "Dept. head sign-off"],
    submittedBy: "Submitted by Debate Society",
    updated: "Updated 4 days ago",
    banner: "linear-gradient(135deg,#131B2E,#2F6AF2)",
    status: "pending",
  },
];

export const TONES: Record<Tone, { bg: string; fg: string; stripe: string }> = {
  blue: { bg: "rgba(0,80,212,.1)", fg: "#0050D4", stripe: "#0050D4" },
  red: { bg: "rgba(225,29,72,.1)", fg: "#B80035", stripe: "#8B263E" },
  amber: { bg: "#FEF3C7", fg: "#92400E", stripe: "#F59E0B" },
  green: { bg: "#D1FAE5", fg: "#065F46", stripe: "#059669" },
};

