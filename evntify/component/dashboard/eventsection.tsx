import Link from "next/link";
import type { CampusEvent } from "@/types/events";
import EventCard from "./eventcard";

interface EventSectionProps {
    title: string;
    href?: string;
    events: CampusEvent[];
}

export default function EventSection({ title, href, events }: EventSectionProps) {
    return (
        <section className="flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                    {title}
                </h2>
                {href && (
                    <Link
                        href={href}
                        className="group inline-flex items-center gap-1 text-sm font-semibold text-brand transition hover:text-[#772840]"
                    >
                        <span>See all</span>
                        <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                )}
            </div>

            {/* Event Cards Scroll Row */}
            {events.length === 0 ? (
                <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/50 text-sm text-neutral-500">
                    No upcoming events found for this section.
                </div>
            ) : (
                <div className="flex w-full gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </section>
    );
}
