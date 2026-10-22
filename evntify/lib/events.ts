import type { CampusEvent, FeaturedEvent } from "@/types/events";

/**
 * NOTE: text marked "PLACEHOLDER" was not in the Figma CSS export
 * (the export only contained styles for those). Replace with real data / API.
 */
export const featuredEvents: FeaturedEvent[] = [
    {
        id: "40th-anniversary-finale",
        org: "Student Council · University of the East", // PLACEHOLDER
        title: "The 40th Anniversary Concert: Finale",
        date: "Nov 28, 2026", // PLACEHOLDER
        time: "6:00 PM", // PLACEHOLDER
        venue: "UE Caloocan Gymnasium", // PLACEHOLDER
        summary:
            "Cap off our 40th anniversary with a night of live performances from student bands, alumni guests and special surprises.", // PLACEHOLDER
        seatsLeft: 120, // PLACEHOLDER
        href: "/events/40th-anniversary-finale",
    },
];

export const tanYanKeeSection = {
    title: "Tan Yan Kee Business & Accountancy", // PLACEHOLDER
    href: "/events",
};

export const tanYanKeeEvents: CampusEvent[] = [
    {
        id: "lits-general-assembly",
        code: "TYK•11",
        org: "LITS", // PLACEHOLDER
        title: "LITS General Assembly",
        date: "Nov 12 · TYK Auditorium", // PLACEHOLDER
        venue: "",
        seatsLeft: 45,
        bannerColor: "#059669",
        href: "/events/lits-general-assembly",
    },
    {
        id: "mr-and-ms-ue",
        code: "TYK•02",
        org: "Student Council", // PLACEHOLDER
        title: "Mister & Miss University of the East",
        date: "Nov 20 · UE Theater", // PLACEHOLDER
        venue: "",
        seatsLeft: 18,
        bannerColor: "#4F46E5",
        href: "/events/mr-and-ms-ue",
    },
    // The Figma export was cut off after card 2 — add more cards here.
];

/** Slot badge rule from the design: >40 green, 11–40 amber, ≤10 red */
export function seatTone(seatsLeft: number) {
    if (seatsLeft > 40) return { dot: "#10B981", text: "#047857" };
    if (seatsLeft > 10) return { dot: "#F59E0B", text: "#B45309" };
    return { dot: "#F43F5E", text: "#BE123C" };
}