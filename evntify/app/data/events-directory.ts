export type Status = "ongoing" | "upcoming" | "scheduled" | "completed";

export interface EventItem {
  id: string;
  dept: string;
  title: string;
  blurb: string;
  status: Status;
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

export const DEPARTMENTS = [
  "All Departments",
  "Engineering",
  "Business",
  "Architecture & Fine Arts",
  "Arts & Sciences",
  "Interdisciplinary",
];

export const EVENTS: EventItem[] = [
  {
    id: "eng-hackathon",
    dept: "Engineering",
    title: "National Engineering Hackathon & Robotics Duel",
    blurb:
      "University-wide hackathon, robotics duel arena, and keynote talks with industry leaders.",
    status: "ongoing",
    org: "Engineering Society",
    date: "Nov 26 – 28, 2025",
    venue: "Engineering Quadrangle",
    registered: 840,
    capacity: 850,
    people: ["AK", "MR", "+3"],
    accent: "#8B263E",
    banner: "linear-gradient(135deg,#3b4a6b,#8B263E)",
    facilities: [
      "Power: 2 generators",
      "Wi-Fi: dedicated SSID",
      "Marshals: 6 on site",
      "First aid: Station B",
    ],
  },
  {
    id: "fintech",
    dept: "Business",
    title: "FinTech Summit 2025: Digital Finance Frontier",
    blurb:
      "Panels exploring algorithmic liquidity, tokenized institutional assets, and regulatory sandboxes.",
    status: "upcoming",
    org: "Business Guild",
    date: "Dec 04, 2025 · 9 AM – 4 PM",
    venue: "Grand Hall, Level 2",
    registered: 385,
    capacity: 500,
    people: ["JL", "TS", "+2"],
    accent: "#0050D4",
    banner: "linear-gradient(135deg,#0d1c2f,#0050D4)",
    facilities: [
      "Stage: main + breakout",
      "AV: 2 operators",
      "Catering: confirmed",
      "Marshals: 4 on site",
    ],
  },
  {
    id: "archfest",
    dept: "Architecture & Fine Arts",
    title: "ArchFest Design Expo: Resilient Futures",
    blurb:
      "Curated student thesis showcases featuring climate-resilient vernacular architecture.",
    status: "ongoing",
    org: "Architecture Society",
    date: "Nov 24 – 30, 2025",
    venue: "Gallery East & Atrium",
    registered: 273,
    capacity: 300,
    people: ["PD", "NC"],
    accent: "#F59E0B",
    banner: "linear-gradient(135deg,#5c3f40,#F59E0B)",
    facilities: [
      "Lighting: gallery rig",
      "Security: 2 guards",
      "Wi-Fi: standard",
      "First aid: Atrium desk",
    ],
  },
  {
    id: "cosmic",
    dept: "Arts & Sciences",
    title: "Cosmic Horizons: Frontiers in Astrophysics",
    blurb:
      "Theoretical physics colloquium dissecting gravitational wave interferometry and dark matter.",
    status: "scheduled",
    org: "Physics Circle",
    date: "Dec 09, 2025 · 1 – 5 PM",
    venue: "Science Auditorium",
    registered: 156,
    capacity: 200,
    people: ["EV", "RB"],
    accent: "#2F6AF2",
    banner: "linear-gradient(135deg,#131B2E,#2F6AF2)",
    facilities: [
      "AV: projector + stream",
      "Seating: fixed",
      "Wi-Fi: standard",
      "Marshals: 2 on site",
    ],
  },
  {
    id: "av-challenge",
    dept: "Engineering",
    title: "Autonomous Vehicle Challenge 2025",
    blurb:
      "Annual outdoor obstacle navigational competition for sensor fusion, LIDAR and path planning.",
    status: "completed",
    org: "Robotics Club",
    date: "Oct 12, 2025",
    venue: "North Campus Track",
    registered: 400,
    capacity: 400,
    people: ["DM", "SQ", "+4"],
    accent: "#565E74",
    banner: "linear-gradient(135deg,#565E74,#9aa3b8)",
    facilities: [
      "Track: closed course",
      "Power: grid",
      "Marshals: 8 on site",
      "First aid: Gate 2",
    ],
  },
  {
    id: "social-hack",
    dept: "Interdisciplinary",
    title: "Global Social Enterprise Hack: Green Campus",
    blurb:
      "48-hour venture creation sprint addressing equitable campus green infrastructure.",
    status: "ongoing",
    org: "Enactus",
    date: "Nov 27 – 29, 2025",
    venue: "Innovation Hub",
    registered: 264,
    capacity: 300,
    people: ["HG", "OL", "+1"],
    accent: "#8B263E",
    banner: "linear-gradient(135deg,#233144,#8B263E)",
    facilities: [
      "Workspace: open floor",
      "Wi-Fi: dedicated SSID",
      "Catering: overnight",
      "Marshals: 3 on site",
    ],
  },
];

export const STATUS_LABEL: Record<Status, string> = {
  ongoing: "Ongoing Now",
  upcoming: "Upcoming",
  scheduled: "Scheduled",
  completed: "Completed",
};
export const STATUS_COLOR: Record<Status, string> = {
  ongoing: "#8B263E",
  upcoming: "#0050D4",
  scheduled: "#565E74",
  completed: "#D5E3FD",
};

export const pct = (e: EventItem) =>
  Math.round((e.registered / e.capacity) * 100);
export function capacityTone(p: number) {
  if (p >= 95) return { bar: "#E11D48", text: "#E11D48", label: "Full" };
  if (p >= 85) return { bar: "#F59E0B", text: "#D97706", label: "Near capacity" };
  return { bar: "#10B981", text: "#059669", label: "Registered" };
}

