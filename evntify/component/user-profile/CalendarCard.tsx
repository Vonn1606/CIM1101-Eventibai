"use client";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { calendar as c } from "@/lib/events";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarCard() {
  const days = Array.from({ length: c.days }, (_, i) => i + 1);
  return (
    <div className="rounded-xl bg-white px-5 pb-0 shadow-sm">
      <div className="-mx-5 flex items-center justify-between rounded-t-xl bg-surface-low/50 p-3">
        <div className="flex items-center gap-1 pl-2">
          <Calendar className="size-4 text-maroon" />
          <h2 className="text-lg font-bold">{c.monthLabel}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Previous month" className="grid size-8 place-items-center rounded-lg text-body hover:bg-surface-high transition">
            <ChevronLeft className="size-3.5" />
          </button>
          <button className="rounded-lg bg-maroon-tint/60 px-2 py-1 text-[10px] font-bold tracking-[0.6px] text-maroon hover:bg-maroon-tint transition">
            Today
          </button>
          <button aria-label="Next month" className="grid size-8 place-items-center rounded-lg text-body hover:bg-surface-high transition">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 pt-1">
        {WEEK.map((d, i) => (
          <span key={i} className="text-center text-[10px] font-bold uppercase tracking-[0.5px] text-muted">
            {d}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 pb-3">
        {c.prevTail.map((d) => (
          <span key={`p${d}`} className="grid h-[60px] place-items-center text-[11px] text-surface-highest">
            {d}
          </span>
        ))}
        {days.map((d) => {
          const featured = d === c.featured;
          const reg = c.registered.includes(d);
          const base = "relative flex h-[60px] flex-col items-center justify-center rounded-lg text-[13px] transition cursor-pointer";
          if (featured)
            return (
              <button key={d} className={`${base} gap-0.5 rounded-xl bg-maroon font-bold text-[15px] text-white shadow-md`}>
                {d}
                <span className="size-1.5 rounded-full bg-mint" />
              </button>
            );
          if (reg)
            return (
              <button key={d} className={`${base} gap-0.5 rounded-xl bg-maroon-tint font-bold text-[15px] text-maroon-ink shadow-sm`}>
                {d}
                <span className="size-1.5 rounded-full bg-maroon" />
              </button>
            );
          return (
            <button key={d} className={`${base} hover:bg-surface-low`}>
              {d}
            </button>
          );
        })}
      </div>

      <div className="-mx-5 flex justify-between rounded-b-xl bg-surface-low/40 p-3">
        {[
          ["bg-maroon", "Selected date"],
          ["bg-green", "Registered"],
          ["bg-surface-highest", "No events"],
        ].map(([dot, label]) => (
          <span key={label} className="flex items-center gap-1 text-[10px] font-bold tracking-[0.6px] text-body">
            <i className={`size-3 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

