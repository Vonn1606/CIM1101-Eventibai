"use client";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

interface CalendarCardProps {
  monthLabel: string;
  prevTail: number[];
  days: number;
  featured: number;
  registered: number[];
  openEvents?: number[];
  selectedDay?: number | null;
  onDayClick?: (day: number) => void;
  prevHref?: string;
  nextHref?: string;
  todayHref?: string;
}

export default function CalendarCard({
  monthLabel,
  prevTail,
  days: totalDays,
  featured,
  registered,
  openEvents = [],
  selectedDay,
  onDayClick,
  prevHref,
  nextHref,
  todayHref,
}: CalendarCardProps) {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  return (
    <div className="rounded-xl bg-white px-5 pb-0 shadow-sm">
      <div className="-mx-5 flex items-center justify-between rounded-t-xl bg-surface-low/50 p-3">
        <div className="flex items-center gap-1 pl-2">
          <Calendar className="size-4 text-maroon" />
          <h2 className="text-lg font-bold">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-1">
          {prevHref ? (
            <Link
              href={prevHref}
              aria-label="Previous month"
              className="grid size-8 place-items-center rounded-lg text-body hover:bg-surface-high transition"
            >
              <ChevronLeft className="size-3.5" />
            </Link>
          ) : (
            <button aria-label="Previous month" className="grid size-8 place-items-center rounded-lg text-body opacity-50 cursor-not-allowed">
              <ChevronLeft className="size-3.5" />
            </button>
          )}
          {todayHref && (
            <Link
              href={todayHref}
              className="rounded-lg bg-maroon-tint/60 px-2 py-1 text-[10px] font-bold tracking-[0.6px] text-maroon hover:bg-maroon-tint transition"
            >
              Today
            </Link>
          )}
          {nextHref ? (
            <Link
              href={nextHref}
              aria-label="Next month"
              className="grid size-8 place-items-center rounded-lg text-body hover:bg-surface-high transition"
            >
              <ChevronRight className="size-3.5" />
            </Link>
          ) : (
            <button aria-label="Next month" className="grid size-8 place-items-center rounded-lg text-body opacity-50 cursor-not-allowed">
              <ChevronRight className="size-3.5" />
            </button>
          )}
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
        {prevTail.map((d) => (
          <span key={`p${d}`} className="grid h-[60px] place-items-center text-[11px] text-surface-highest">
            {d}
          </span>
        ))}
        {days.map((d) => {
          const isFeatured = d === featured;
          const reg = registered.includes(d);
          const isOpen = openEvents.includes(d);
          const base = "relative flex h-[60px] flex-col items-center justify-center rounded-lg text-[13px] transition cursor-pointer";
          if (isFeatured)
            return (
              <button key={d} className={`${base} gap-0.5 rounded-xl bg-maroon font-bold text-[15px] text-white shadow-md`} onClick={() => onDayClick?.(d)}>
                {d}
                <span className="size-1.5 rounded-full bg-mint" />
              </button>
            );
          if (reg)
            return (
              <button key={d} className={`${base} gap-0.5 rounded-xl ${selectedDay === d ? "ring-2 ring-maroon bg-maroon-tint" : "bg-maroon-tint"} font-bold text-[15px] text-maroon-ink shadow-sm`} onClick={() => onDayClick?.(d)}>
                {d}
                <span className="size-1.5 rounded-full bg-maroon" />
              </button>
            );
          if (isOpen)
            return (
              <button
                key={d}
                className={`${base} gap-0.5 rounded-xl ${selectedDay === d ? "ring-2 ring-blue-600 bg-blue-50" : "bg-blue-50/70 hover:bg-blue-50"} font-semibold text-[14px] text-blue-900 shadow-xs`}
                onClick={() => onDayClick?.(d)}
              >
                {d}
                <span className="size-1.5 rounded-full bg-blue-600" />
              </button>
            );
          return (
            <button key={d} className={`${base} ${selectedDay === d ? "ring-2 ring-maroon bg-surface-low" : "hover:bg-surface-low"}`} onClick={() => onDayClick?.(d)}>
              {d}
            </button>
          );
        })}
      </div>

      <div className="-mx-5 flex justify-between rounded-b-xl bg-surface-low/40 p-3">
        {[
          ["bg-maroon", "Registered"],
          ["bg-blue-600", "Open event"],
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
