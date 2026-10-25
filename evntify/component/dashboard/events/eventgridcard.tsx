"use client";

import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Ticket, ArrowRight } from "lucide-react";
import type { EventDetail } from "@/types/events";
import { seatTone } from "@/lib/events";

export default function EventGridCard({ event }: { event: EventDetail }) {
  const tone = seatTone(event.seatsLeft);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Banner / Poster Header */}
      <div
        className="relative flex h-36 flex-col justify-between p-4"
        style={{
          background: `linear-gradient(135deg, ${event.bannerColor} 0%, #1e2022 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white">
            {event.category || "Campus Event"}
          </span>

          <span
            className="relative inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold shadow-sm"
            style={{ color: tone.text }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: tone.dot }}
            />
            {event.seatsLeft} Seats Left
          </span>
        </div>

        <p className="font-mono text-2xl font-extrabold italic tracking-tight text-white/20">
          {event.code}
        </p>
      </div>

      {/* Body Info */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6c0c28]">
            <Users size={12} />
            <span>{event.org}</span>
          </div>

          <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#6c0c28] transition-colors leading-snug">
            {event.title}
          </h3>

          <div className="flex flex-col gap-1 text-xs text-neutral-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-neutral-400" />
              {event.date} · {event.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-neutral-400" />
              {event.venue}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-3">
          <Link
            href={event.href}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#6c0c28] px-3 text-xs font-bold text-white transition hover:bg-[#8b263e]"
          >
            <span>View Event Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
