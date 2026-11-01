"use client";
import SignInPrompt from "@/component/dashboard/events/signinprompt";
import { useAuth } from "@/lib/use-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FeaturedEvent } from "@/types/events";
import { ClockIcon, PinIcon, TicketIcon, CalendarIcon } from "./layout-dashboard/icons";

export default function FeaturedCarousel({ events }: { events: FeaturedEvent[] }) {
    const [index, setIndex] = useState(0);
    const { user } = useAuth();                          // new
    const [promptOpen, setPromptOpen] = useState(false); // new
    const event = events[index];



    // auto-advance every 6s when there is more than one slide
    useEffect(() => {
        if (events.length < 2) return;
        const t = setInterval(() => setIndex((i) => (i + 1) % events.length), 6000);
        return () => clearInterval(t);
    }, [events.length]);

    if (!event) return null;
    const ctaClass =
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 text-sm font-bold uppercase tracking-[0.7px] text-neutral-950 shadow-[0_10px_15px_-3px_rgba(2,44,34,0.3),0_4px_6px_-4px_rgba(2,44,34,0.3)] transition hover:bg-emerald-400";

    return (
        <>
            <section
                aria-roledescription="carousel"
                aria-label="Featured campus events"
                className="relative isolate flex min-h-[340px] w-full flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-[linear-gradient(135deg,#2B2226_0%,#21191C_50%,#171214_100%)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
            >
                {/* Decorative backdrop */}
                <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] opacity-[0.15]">
                    <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-brand blur-[32px]" />
                    <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-emerald-500 blur-[32px]" />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1230 338" preserveAspectRatio="none">
                        <rect x="480" y="34" width="270" height="270" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="1.27" strokeDasharray="6 6" />
                        <rect x="488" y="105" width="254" height="68" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="1.27" />
                        <rect x="488" y="211" width="254" height="51" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="0.85" />
                    </svg>
                </div>

                {/* Slide */}
                <div className="relative z-[2] flex min-h-[320px] flex-col gap-[18.5px] p-7">
                    {/* Host org pill */}
                    <div className="flex">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.3px] text-[#FDF2F4]">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            {event.org}
                        </span>
                    </div>

                    {/* Title + info */}
                    <div className="flex flex-col gap-[7.5px] py-4">
                        <h2 className="text-2xl font-extrabold uppercase leading-[1.1] tracking-[-0.9px] text-white sm:text-4xl">
                            {event.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
                            <span className="flex items-center gap-1 text-neutral-300">
                                <CalendarIcon className="h-3 w-3 text-emerald-500" />
                                {event.date}
                            </span>
                            <span className="text-neutral-500">•</span>
                            <span className="flex items-center gap-1 text-neutral-300">
                                <ClockIcon className="h-3 w-3 text-emerald-500" />
                                {event.time}
                            </span>
                            <span className="text-neutral-500">•</span>
                            <span className="flex items-center gap-1 text-neutral-200">
                                <PinIcon className="h-3 w-3 text-rose-400" />
                                {event.venue}
                            </span>
                        </div>
                        <p className="max-w-[672px] pt-1 text-sm leading-5 text-neutral-300">
                            {event.summary}
                        </p>
                    </div>

                    {/* CTA row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-white/10 pt-3">
                        {user ? (
                            <Link href={event.href} className={ctaClass}>
                                <TicketIcon className="h-3.5 w-3.5" /> Register
                            </Link>
                        ) : (
                            <button type="button" onClick={() => setPromptOpen(true)} className={ctaClass}>
                                <TicketIcon className="h-3.5 w-3.5" /> Register
                            </button>
                        )}
                        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                            <span className="h-2 w-2 rounded-full bg-rose-400" />
                            {event.seatsLeft} seats left
                        </span>
                    </div>
                </div>

                {/* Pagination dots */}
                <div className="relative z-0 flex items-center justify-center gap-1.5 pb-3">
                    {events.map((e, i) => (
                        <button
                            key={e.id}
                            type="button"
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === index}
                            onClick={() => setIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-emerald-500" : "w-1.5 bg-white/30"
                                }`}
                        />
                    ))}
                </div>
            </section>
            <SignInPrompt
                open={promptOpen}
                onClose={() => setPromptOpen(false)}
                nextPath={event.href}
            />
        </>
    );
}
