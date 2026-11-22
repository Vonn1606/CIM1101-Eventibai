"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Users, Info } from "lucide-react";
import type { CalendarEventItem } from "@/lib/db/stats";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarProps {
  events?: CalendarEventItem[];
  year?: number;
  month?: number;
}

export default function Calendar({
  events = [],
  year: propYear,
  month: propMonth,
}: CalendarProps) {
  const router = useRouter();
  const currentNow = useMemo(() => new Date(), []);
  const year = propYear ?? currentNow.getFullYear();
  const month = propMonth ?? currentNow.getMonth();
  const viewKey = `${year}-${month}`;

  const isCurrentMonth = year === currentNow.getFullYear() && month === currentNow.getMonth();
  const [selection, setSelection] = useState<{ key: string; day: number | null }>({
    key: viewKey,
    day: null,
  });

  const monthLabel = useMemo(() => {
    return new Date(year, month, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [year, month]);

  // Build grid
  const { leading, days, dayEventsMap } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    // Mon-start: 0=Mon ... 6=Sun
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const leadingDays = Array.from(
      { length: startDayOfWeek },
      (_, i) => daysInPrevMonth - startDayOfWeek + i + 1
    );
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const map = new Map<number, CalendarEventItem[]>();
    events.forEach((ev) => {
      if (!ev.starts_at) return;
      const d = new Date(ev.starts_at);
      const dayNum = Number(
        new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", day: "numeric" }).format(d)
      );
      const evYear = Number(
        new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric" }).format(d)
      );
      const evMonth =
        Number(
          new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", month: "numeric" }).format(d)
        ) - 1;
      if (evYear === year && evMonth === month) {
        const existing = map.get(dayNum) ?? [];
        existing.push(ev);
        map.set(dayNum, existing);
      }
    });

    return {
      leading: leadingDays,
      days: monthDays,
      dayEventsMap: map,
    };
  }, [year, month, events]);

  const todayDay = currentNow.getDate();
  const todayHasEvents = isCurrentMonth && (dayEventsMap.get(todayDay)?.length ?? 0) > 0;
  const userSelectedDay = selection.key === viewKey ? selection.day : null;
  const selectedDay = userSelectedDay ?? (todayHasEvents ? todayDay : null);
  const setSelectedDay = (day: number | null) => setSelection({ key: viewKey, day });

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 1, 1);
    const m = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    router.push(`/admin?m=${m}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    const m = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    router.push(`/admin?m=${m}`);
  };

  const handleToday = () => {
    router.push("/admin");
  };

  // Determine active spotlight events (only if selected day has scheduled events)
  const selectedDayEvents = selectedDay !== null ? (dayEventsMap.get(selectedDay) ?? []) : [];
  const hasSpotlight = selectedDayEvents.length > 0;

  const isWeekend = (dayNum: number) => {
    const d = new Date(year, month, dayNum);
    const dow = d.getDay();
    return dow === 0 || dow === 6;
  };

  return (
    <div className="col-left">
      <div className="card cal">
        <div className="cal-head">
          <div className="cal-title">
            <span className="sq-btn">
              <CalendarDays size={16} color="#B80035" />
            </span>
            <h3>{monthLabel}</h3>
          </div>
          <div className="cal-nav">
            <button type="button" onClick={handlePrevMonth} aria-label="Previous month">
              <ChevronLeft size={10} />
            </button>
            <button type="button" onClick={handleNextMonth} aria-label="Next month">
              <ChevronRight size={10} />
            </button>
            <button type="button" onClick={handleToday} className="today cursor-pointer">
              Today
            </button>
          </div>
        </div>

        <div className="dow">
          {DOW.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="days">
          {leading.map((d) => (
            <div key={`p${d}`} className="day prev">
              {d}
            </div>
          ))}
          {days.map((d) => {
            const evs = dayEventsMap.get(d);
            const hasEv = evs && evs.length > 0;
            const firstEv = evs?.[0];
            const isSel = d === selectedDay;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`day ${isSel ? "selected" : ""} ${hasEv && !isSel ? "week" : ""}`}
              >
                <span className="day-top">
                  <span
                    className={`day-num ${isWeekend(d) ? "dim" : ""} ${hasEv ? "red-text" : ""}`}
                  >
                    {d}
                  </span>
                  {hasEv && <span className={`ev-dot ${isSel ? "big" : ""}`} />}
                </span>
                {hasEv && (
                  <span className={`ev-tag ${isSel ? "solid-sel" : "red"}`}>
                    {firstEv?.category ? firstEv.category.slice(0, 7) : "Event"}
                    {evs && evs.length > 1 ? ` +${evs.length - 1}` : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="legend">
          <div className="legend-items">
            <span>
              <i style={{ background: "#E11D48" }} /> Scheduled event
            </span>
            <span>
              <i style={{ background: "#0050D4" }} /> Active booking
            </span>
          </div>
        </div>
      </div>

      {hasSpotlight && selectedDay !== null && (
        <div className="card spotlight">
          <div className="spot-head">
            <div className="spot-left">
              <div className="date-chip">
                <small>
                  {new Date(year, month, 1).toLocaleDateString("en-US", { month: "short" })}
                </small>
                <b>{selectedDay}</b>
              </div>
              <div>
                <div className="chips">
                  <span className="chip" style={{ background: "#DAE2FD", color: "#131B2E" }}>
                    {selectedDayEvents[0]?.category || "Campus Event"}
                  </span>
                  <span className="chip" style={{ background: "#FFDADA", color: "#40000C" }}>
                    Confirmed
                  </span>
                </div>
                <h4>
                  {selectedDayEvents[0]?.title}
                  {selectedDayEvents.length > 1 ? ` (+${selectedDayEvents.length - 1} more)` : ""}
                </h4>
              </div>
            </div>
            <button type="button" className="ghost-btn" aria-label="Details">
              <Info size={15} />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {selectedDayEvents.map((ev, idx) => {
              const timeStr = ev.starts_at
                ? new Date(ev.starts_at).toLocaleTimeString("en-US", {
                    timeZone: "Asia/Manila",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "TBD";
              return (
                <div key={ev.id || idx} className={idx > 0 ? "pt-3 border-t border-neutral-100" : ""}>
                  {idx > 0 && (
                    <h5 className="font-semibold text-xs text-neutral-800 mb-1.5">{ev.title}</h5>
                  )}
                  <div className="spot-meta">
                    <div>
                      <Clock size={15} color="#B80035" />
                      <div>
                        <span className="label-sm">Time</span>
                        <p>{timeStr}</p>
                      </div>
                    </div>
                    <div>
                      <MapPin size={15} color="#B80035" />
                      <div>
                        <span className="label-sm">Venue</span>
                        <p>{ev.venue || "Campus Venue"}</p>
                      </div>
                    </div>
                    <div>
                      <Users size={15} color="#B80035" />
                      <div>
                        <span className="label-sm">Status</span>
                        <p>Open for attendance</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="spot-foot">
            <div>
              <Info size={15} color="#0050D4" />
              <span className="t-12 muted">Managed via Student Affairs &amp; Council.</span>
            </div>
            <a href="/admin/events-directory" className="soft-btn">
              View in Directory <ChevronRight size={8} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
