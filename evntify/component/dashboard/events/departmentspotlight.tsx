"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import type { EventDetail } from "@/types/events";

export default function DepartmentSpotlight({ event }: { event: EventDetail }) {
  if (!event) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6c0c28] via-[#8b263e] to-[#006d43] p-6 text-white shadow-md">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider text-white w-fit">
            <Sparkles size={12} className="text-amber-300" />
            Spotlight Featured Event
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {event.title}
          </h2>
          <p className="text-sm text-white/90 line-clamp-2">
            {event.summary}
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-white/80 pt-1">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {event.date}
            </span>
            <span>·</span>
            <span>{event.venue}</span>
            <span>·</span>
            <span className="text-amber-200">{event.seatsLeft} slots remaining</span>
          </div>
        </div>

        <Link
          href={event.href}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#6c0c28] shadow-sm hover:bg-neutral-100 transition whitespace-nowrap self-start md:self-auto"
        >
          <span>View & Register</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
    </section>
  );
}
