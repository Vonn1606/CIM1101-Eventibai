// types/dashboard.ts

export interface EventItem {
    id: string;
    title: string;
    hostOrg: string;
    date: string;
    location: string;
    summary?: string;
    seatsLeft: number;
    locationCode?: string; // e.g., 'TYK•11', 'TYK•02'
    bannerColor?: string;  // e.g., '#059669', '#4F46E5'
    isFeatured?: boolean;
}

export type SlotStatus = 'available' | 'limited' | 'full';

export function getSlotStatus(seatsLeft: number): { label: string; colorClass: string; bgClass: string } {
    if (seatsLeft > 40) {
        return { label: `${seatsLeft} Seats Left`, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-500' };
    } else if (seatsLeft > 10) {
        return { label: `${seatsLeft} Slots Left`, colorClass: 'text-amber-700', bgClass: 'bg-amber-500' };
    } else {
        return { label: `${seatsLeft} Slots Left`, colorClass: 'text-rose-700', bgClass: 'bg-rose-500' };
    }
}