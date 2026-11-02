/**
 * lib/events.ts
 *
 * Shared client-safe utilities for event display.
 * All mock data and static arrays have been removed — data is now sourced
 * from Supabase via lib/db/events.ts and app/actions/.
 */

/** Slot badge colour rule: >40 green, 11-40 amber, ≤10 red */
export function seatTone(seatsLeft: number) {
    if (seatsLeft > 40) return { dot: "#10B981", text: "#047857" };
    if (seatsLeft > 10) return { dot: "#F59E0B", text: "#B45309" };
    return { dot: "#F43F5E", text: "#BE123C" };
}

/** Format an ISO date string to a locale-friendly label (e.g. "Nov 2, 2026") */
export function formatEventDate(isoDate: string): string {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
