import type { DepartmentId } from "@/lib/department";

export type FeaturedEvent = {
    id: string;
    org: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    summary: string;
    seatsLeft: number;
    href: string;
};

export type CampusEvent = {
    id: string;
    code: string; // big faded label on the banner, e.g. "TYK•11"
    org: string;
    title: string;
    venue: string;
    seatsLeft: number;
    bannerColor: string; // any CSS colour; swap for an <img> later
    href: string;
    department?: DepartmentId;   // which college it belongs to
    tag?: string;                // small pill on the card, e.g. "Hackathon"
    startsAt?: string;           // ISO date-time, replaces `date`
    createdAt?: string;          // for the "Recently Added" sort
    status?: "open" | "concluded";
    date: string;
};

export type EventFeature = {
    title: string;
    body: string;
    iconType: "maroon" | "green" | "amber";
};

export type EventDetail = {
    id: string;
    code: string;
    title: string;
    org: string;
    orgDept: string;
    orgInitials: string;
    orgEst?: string;
    statusBadge?: string;
    breadcrumbDept?: string;
    briefingEyebrow?: string;
    overviewTitle?: string;
    category: string;
    date: string;
    time: string;
    doorsOpen: string;
    venue: string;
    venueDetails: string;
    summary: string;
    description: string[];
    features: EventFeature[];
    totalCapacity: number;
    registeredCount: number;
    seatsLeft: number;
    registrationDeadline: string;
    bannerColor: string;
    status: "OPEN" | "LIMITED" | "CLOSING SOON" | "FULL" | "COMPLETED";
    coordinator: {
        name: string;
        role: string;
        email: string;
        phone: string;
        initials: string;
    };
    href: string;
};

