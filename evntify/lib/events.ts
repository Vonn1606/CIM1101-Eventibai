import type { CampusEvent, FeaturedEvent, EventDetail } from "@/types/events";

/**
 * Event database containing detailed event information
 * for event details pages (/events/[id]).
 */
export const eventsDatabase: Record<string, EventDetail> = {
    "lits-arena-figma-showdown-2026": {
        id: "lits-arena-figma-showdown-2026",
        code: "LITS-FIGMA-2026-CLR2",
        title: "LITS Arena: Figma Showdown 2026",
        org: "College of Engineering",
        orgDept: "League of Information Technology Students (LITS)",
        orgInitials: "CoE",
        orgEst: "EST. '64",
        breadcrumbDept: "College of Engineering (CoE)",
        statusBadge: "VERIFIED ACADEMIC COMPETITION",
        category: "Academic & Design Hackathon",
        date: "January 13, 2027",
        time: "9:00 AM – 3:00 PM",
        doorsOpen: "Check-in starts 8:15 AM",
        venue: "CLR2 (Computer Lab 2)",
        venueDetails: "Engineering Building, 2nd Floor",
        summary:
            "The LITS Arena: Figma Showdown 2026 gathers aspiring campus product designers, UX researchers, and software craftsmen in a fast-paced interactive design hackathon.",
        briefingEyebrow: "BRIEFING • OBJECTIVES",
        overviewTitle: "Event Overview & Challenge Scope",
        description: [
            "The LITS Arena: Figma Showdown 2026 gathers aspiring campus product designers, UX researchers, and software craftsmen in a fast-paced interactive design hackathon. The mission of this year's arena is solving tactile campus pain-points: from digital queue management at student registrar offices to collaborative student study-hub booking.",
            "Participants will receive a design brief revealed at exactly 1:15 PM and must produce an end-to-end interactive component-driven Figma prototype accompanied by a 3-minute lightning walkthrough deck."
        ],
        features: [
            {
                title: "Prerequisites",
                body: "Active Figma for Education account, basic understanding of auto-layout, design variables, and components.",
                iconType: "maroon"
            },
            {
                title: "Hardware / BYOD",
                body: 'Lab stations provided with 27" 4K displays. Participants may bring their own laptops and graphic tablets.',
                iconType: "green"
            },
            {
                title: "Prizes & Credential",
                body: "₱15,000 top cash pool, official CoE design trophies, and Figma Community badge accreditation.",
                iconType: "amber"
            }
        ],
        totalCapacity: 60,
        registeredCount: 42,
        seatsLeft: 18,
        registrationDeadline: "2027-01-13T08:30:00",
        bannerColor: "#1e2022",
        status: "OPEN",
        coordinator: {
            name: "Marcus Rivera",
            role: "LITS Lead Organizer • CoE Senior",
            email: "lits.arena@campus.edu",
            phone: "Local Ext: 4402 (Lab Admin)",
            initials: "MR"
        },
        href: "/events/lits-arena-figma-showdown-2026"
    },
    "40th-anniversary-finale": {
        id: "40th-anniversary-finale",
        code: "UE•40",
        title: "The 40th Anniversary Concert: Finale",
        org: "Student Council",
        orgDept: "University of the East · Central Office",
        orgInitials: "SC",
        orgEst: "EST. '86",
        breadcrumbDept: "University Student Council",
        statusBadge: "CAMPUS CONCERT CELEBRATION",
        category: "Concert & Music",
        date: "Friday, Nov 28, 2026",
        time: "6:00 PM – 10:00 PM",
        doorsOpen: "Doors open at 5:00 PM · Ticket check-in required",
        venue: "UE Caloocan Gymnasium",
        venueDetails: "Tan Yan Kee Academic Building, 4th Floor",
        summary:
            "Cap off our 40th anniversary celebration with an unforgettable night of live musical performances, alumni guest bands, and special campus honors.",
        briefingEyebrow: "HIGHLIGHTS • PERFORMANCES",
        overviewTitle: "Event Overview & Concert Highlights",
        description: [
            "Join the entire University of the East community as we mark four vibrant decades of academic excellence, campus spirit, and student talent. The 40th Anniversary Concert brings together headlining student performers, distinguished alumni artists, and guest indie bands for an evening of music and celebration.",
            "Admission is free for all currently enrolled UE students, faculty, and alumni. Pre-registration through Eventify is strictly required to secure entry and guarantee your digital QR ticket pass.",
            "Attendees will receive an official commemorative event wristband, admission to the raffle draws, and exclusive anniversary celebration giveaways upon scanning their digital QR ticket at the gate."
        ],
        features: [
            {
                title: "Live Performances",
                body: "Student bands, battle of the bands champions, and special alumni guest artists.",
                iconType: "maroon"
            },
            {
                title: "Fast QR Check-in",
                body: "Contactless digital pass verification for rapid venue entry without paper tickets.",
                iconType: "green"
            },
            {
                title: "Commemorative Kits",
                body: "Complimentary 40th anniversary merchandise and raffle entry for the first 350 check-ins.",
                iconType: "amber"
            }
        ],
        totalCapacity: 500,
        registeredCount: 380,
        seatsLeft: 120,
        registrationDeadline: "2026-11-28T17:00:00",
        bannerColor: "#6c0c28",
        status: "OPEN",
        coordinator: {
            name: "Mark Dela Cruz",
            role: "Student Council Activities Head",
            email: "studentcouncil@ue.edu.ph",
            phone: "+63 (2) 8735 5471 ext. 204",
            initials: "SC"
        },
        href: "/events/40th-anniversary-finale"
    },
    "lits-general-assembly": {
        id: "lits-general-assembly",
        code: "TYK•11",
        title: "LITS General Assembly 2026",
        org: "League of Information Technology Students",
        orgDept: "Lucio Tan College of Computer Studies",
        orgInitials: "LITS",
        orgEst: "EST. '98",
        breadcrumbDept: "College of Computer Studies",
        statusBadge: "VERIFIED DEPARTMENT ASSEMBLY",
        category: "Academic & Tech",
        date: "Thursday, Nov 12, 2026",
        time: "1:00 PM – 5:00 PM",
        doorsOpen: "Doors open at 12:30 PM",
        venue: "TYK Auditorium",
        venueDetails: "Tan Yan Kee Academic Building, 5th Floor",
        summary:
            "The official assembly for all IT and CS majors featuring organization milestones, upcoming hackathons, officer recognition, and guest keynote speakers.",
        briefingEyebrow: "BRIEFING • OBJECTIVES",
        overviewTitle: "Event Overview & General Assembly Scope",
        description: [
            "The League of Information Technology Students invites all computer studies students to the 2026 General Assembly. Get first-hand briefings on the upcoming university-wide hackathon, industry mentorship programs, and cert workshops.",
            "Meet your fellow tech enthusiasts, connect with student leaders, and find team members for upcoming national programming and Figma design competitions."
        ],
        features: [
            {
                title: "Keynote Speeches",
                body: "Industry veterans discussing AI software engineering and modern web tooling.",
                iconType: "maroon"
            },
            {
                title: "Verified Attendance",
                body: "Accredited activity hours count toward required departmental student co-curricular credits.",
                iconType: "green"
            },
            {
                title: "Hackathon Reveal",
                body: "Early sneak peek at the challenge briefs, sponsors, and prize pools for Techtris 2026.",
                iconType: "amber"
            }
        ],
        totalCapacity: 200,
        registeredCount: 155,
        seatsLeft: 45,
        registrationDeadline: "2026-11-12T12:30:00",
        bannerColor: "#059669",
        status: "OPEN",
        coordinator: {
            name: "Sophia Reyes",
            role: "LITS Executive Vice President",
            email: "lits.assembly@ue.edu.ph",
            phone: "+63 (2) 8735 5471 ext. 312",
            initials: "SR"
        },
        href: "/events/lits-general-assembly"
    },
    "mr-and-ms-ue": {
        id: "mr-and-ms-ue",
        code: "TYK•02",
        title: "Mister & Miss University of the East 2026",
        org: "Central Student Council",
        orgDept: "Office of Cultural & Student Affairs",
        orgInitials: "CSC",
        orgEst: "EST. '50",
        breadcrumbDept: "Office of Student Affairs",
        statusBadge: "CAMPUS CULTURAL TRADITION",
        category: "Pageantry & Culture",
        date: "Friday, Nov 20, 2026",
        time: "5:00 PM – 9:30 PM",
        doorsOpen: "Doors open at 4:00 PM",
        venue: "UE Theater",
        venueDetails: "University Auditorium, Manila Campus",
        summary:
            "Witness the annual pageant showcasing the intellect, talent, poise, and leadership of student ambassadors from every university college.",
        briefingEyebrow: "BRIEFING • HIGHLIGHTS",
        overviewTitle: "Event Overview & Pageant Scope",
        description: [
            "The grandest stage on campus returns. Mister & Miss University of the East brings together outstanding student delegates representing Engineering, Computer Studies, Business, Arts & Sciences, Health Sciences, and Law.",
            "Cheer for your college delegates through the advocacy presentation, talent showcase, and evening gown and formal wear competition."
        ],
        features: [
            {
                title: "College Delegations",
                body: "Representatives from all 6 campus colleges competing in advocacy, talent, and poise.",
                iconType: "maroon"
            },
            {
                title: "Live Audience Voting",
                body: "Cast your vote for the People's Choice Award directly through the Eventify app.",
                iconType: "green"
            },
            {
                title: "Guest Judges",
                body: "Esteemed panel featuring alumni leaders, cultural advocates, and creative directors.",
                iconType: "amber"
            }
        ],
        totalCapacity: 450,
        registeredCount: 432,
        seatsLeft: 18,
        registrationDeadline: "2026-11-20T16:00:00",
        bannerColor: "#4F46E5",
        status: "LIMITED",
        coordinator: {
            name: "Carlos Mendoza",
            role: "CSC Cultural Committee Head",
            email: "csc.pageant@ue.edu.ph",
            phone: "+63 (2) 8735 5471 ext. 118",
            initials: "CM"
        },
        href: "/events/mr-and-ms-ue"
    }
};

/** Get event details by ID or slug, with graceful fallback */
export function getEventDetail(idOrSlug: string): EventDetail {
    const normalized = (idOrSlug || "").trim().toLowerCase();
    if (eventsDatabase[normalized]) {
        return eventsDatabase[normalized];
    }

    // Attempt match by slug in href or partial id
    const match = Object.values(eventsDatabase).find(
        (e) => e.id.toLowerCase() === normalized || e.href.endsWith(`/${normalized}`)
    );
    if (match) return match;

    // Default to the flagship LITS Arena Figma Showdown 2026
    const base = eventsDatabase["lits-arena-figma-showdown-2026"];
    if (normalized === "" || normalized === "default" || normalized === "figma-showdown") {
        return base;
    }

    // Graceful synthesized event for other dynamic IDs
    const titleFormatted = idOrSlug
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
        ...base,
        id: idOrSlug,
        code: `UE-${idOrSlug.toUpperCase().slice(0, 10)}`,
        title: titleFormatted,
        href: `/events/${idOrSlug}`
    };
}

export function getAllEvents(): EventDetail[] {
    return Object.values(eventsDatabase);
}

export const featuredEvents: FeaturedEvent[] = [
    {
        id: "lits-arena-figma-showdown-2026",
        org: "College of Engineering · LITS",
        title: "LITS Arena: Figma Showdown 2026",
        date: "Jan 13, 2027",
        time: "9:00 AM",
        venue: "CLR2 (Computer Lab 2)",
        summary:
            "The LITS Arena gathers aspiring campus product designers, UX researchers, and software craftsmen in a fast-paced interactive design hackathon.",
        seatsLeft: 18,
        href: "/events/lits-arena-figma-showdown-2026",
    },
    {
        id: "40th-anniversary-finale",
        org: "Student Council · University of the East",
        title: "The 40th Anniversary Concert: Finale",
        date: "Nov 28, 2026",
        time: "6:00 PM",
        venue: "UE Caloocan Gymnasium",
        summary:
            "Cap off our 40th anniversary with a night of live performances from student bands, alumni guests and special surprises.",
        seatsLeft: 120,
        href: "/events/40th-anniversary-finale",
    },
];

export const tanYanKeeSection = {
    title: "College of Engineering & Computer Studies",
    href: "/events",
};

export const tanYanKeeEvents: CampusEvent[] = [
    {
        id: "lits-arena-figma-showdown-2026",
        code: "LITS•FIGMA",
        org: "LITS",
        title: "LITS Arena: Figma Showdown 2026",
        date: "Jan 13 · CLR2 Computer Lab",
        venue: "CLR2 (Computer Lab 2)",
        seatsLeft: 18,
        bannerColor: "#1e2022",
        href: "/events/lits-arena-figma-showdown-2026",
        department: "cs",
        tag: "Competition",
        startsAt: "2026-01-13T09:00:00Z",
        createdAt: "2026-01-01T08:00:00Z",
        status: "open",
    },
    {
        id: "lits-general-assembly",
        code: "TYK•11",
        org: "LITS",
        title: "LITS General Assembly",
        date: "Nov 12 · TYK Auditorium",
        venue: "TYK Auditorium",
        seatsLeft: 45,
        bannerColor: "#059669",
        href: "/events/lits-general-assembly",
        department: "biz",
        tag: "Assembly",
        startsAt: "2026-11-12T13:00:00Z",
        createdAt: "2026-10-01T08:00:00Z",
        status: "open",
    },
    {
        id: "mr-and-ms-ue",
        code: "TYK•02",
        org: "Student Council",
        title: "Mister & Miss University of the East",
        date: "Nov 20 · UE Theater",
        venue: "UE Theater",
        seatsLeft: 18,
        bannerColor: "#4F46E5",
        href: "/events/mr-and-ms-ue",
        department: "biz",
        tag: "Pageant",
        startsAt: "2026-11-20T18:00:00Z",
        createdAt: "2026-10-05T08:00:00Z",
        status: "open",
    },
];

/** Slot badge rule from the design: >40 green, 11–40 amber, ≤10 red */
export function seatTone(seatsLeft: number) {
    if (seatsLeft > 40) return { dot: "#10B981", text: "#047857" };
    if (seatsLeft > 10) return { dot: "#F59E0B", text: "#B45309" };
    return { dot: "#F43F5E", text: "#BE123C" };
}

export function formatEventDate(isoDate: string): string {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}


/* ============================================================================
   My Events Page Types & Mock Data
   ============================================================================ */
export type UpcomingEvent = {
  id: string;
  headerLabel: string;
  headerColor: string;
  featured?: boolean;
  date: string;
  title: string;
  description: string;
  qrCode: string;
  venue: string;
  meta: string;
};

export const upcoming: UpcomingEvent[] = [
  {
    id: "anniv",
    headerLabel: "Featured event",
    headerColor: "bg-charcoal",
    featured: true,
    date: "Oct 17, 2026",
    title: "The 40th Anniversary Concert: FINALE",
    description:
      "Experience the pinnacle musical celebration of the decade with premier university chorales, guest alumni soloists, and the full 75-piece Symphonic Orchestra.",
    qrCode: "EVT-4001",
    venue: "University Auditorium (placeholder)",
    meta: "6:00 PM (placeholder)",
  },
  {
    id: "assembly",
    headerLabel: "General assembly",
    headerColor: "bg-green",
    date: "Oct 26, 2026",
    title: "You've Got A Friend In Me: General Assembly",
    description:
      "Annual freshman and senior networking convention, featuring keynote speaker sessions on emerging tech stacks and department project showcases.",
    qrCode: "EVT-4002",
    venue: "Main Hall (placeholder)",
    meta: "1:00 PM (placeholder)",
  },
  {
    id: "figma",
    headerLabel: "Competition",
    headerColor: "bg-maroon-light",
    date: "Oct 30, 2026",
    title: "LITS Arena: Figma Showdown 2026",
    description:
      "Speed UI/UX prototyping challenge. Participants solve real-world accessibility and micro-mobility campus design prompts live on stage.",
    qrCode: "EVT-4003",
    venue: "Innovation Lab (placeholder)",
    meta: "9:00 AM (placeholder)",
  },
];

export type PastEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  venue: string;
  meta: string;
  status: "attended" | "missed" | "closed";
  footer: string;
};

export const past: PastEvent[] = [
  {
    id: "expo",
    date: "Sep 2026 (placeholder)",
    title: "Global Tech Career Expo & Alumni Mixer 2026",
    description:
      "Met with over 45 corporate partners and tech recruiters. Resume submission confirmed for Cloud Infrastructure tracks.",
    venue: "Convention Hall (placeholder)",
    meta: "Verified attendance",
    status: "attended",
    footer: "Checked in by Proctor @ 09:14 AM",
  },
  {
    id: "robotics",
    date: "Sep 2026 (placeholder)",
    title: "Autonomous Robotics & AI Colloquium",
    description:
      "Symposium showcasing undergraduate capstone engineering projects and industrial automation exhibits.",
    venue: "Engineering Hall (placeholder)",
    meta: "Concluded",
    status: "closed",
    footer: "Certificate unavailable (placeholder)",
  },
  {
    id: "convo",
    date: "Aug 2026 (placeholder)",
    title: "University General Convocation & Welcome Walk",
    description:
      "Official ceremonial welcome for academic year 2026-2027 and president's annual campus address.",
    venue: "University Grounds (placeholder)",
    meta: "Concluded",
    status: "closed",
    footer: "Certificate unavailable (placeholder)",
  },
];

// October 2026 starts on a Thursday.
export const calendar = {
  monthLabel: "October 2026",
  prevTail: [27, 28, 29, 30],
  days: 31,
  featured: 17,
  registered: [26, 30],
};
