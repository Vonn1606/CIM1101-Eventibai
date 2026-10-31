import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
};

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const ChevronDownIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const CalendarIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const BellIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
export const UserIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
export const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const PinIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
);
export const TicketIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><path d="M13 5v2M13 17v2M13 11v2" /></svg>
);

export const StarIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} fill="currentColor" {...p}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>
);
export const ArrowRightIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const GraduationCapIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M22 10 12 5 2 10l10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /><path d="M22 10v6" /></svg>
);
export const SparkIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>
);