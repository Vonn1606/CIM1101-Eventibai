"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Users, Info } from "lucide-react";
import type { UpcomingEventItem, FeaturedEventItem } from "@/lib/db/stats";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarProps {
  events?: UpcomingEventItem[];
  featuredEvent?: FeaturedEventItem | null;
}

export default function Calendar({ events = [], featuredEvent }: CalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

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

    const map = new Map<number, UpcomingEventItem>();
    events.forEach((ev) => {
      if (!ev.starts_at) return;
      const d = new Date(ev.starts_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        map.set(d.getDate(), ev);
      }
    });

    return {
      leading: leadingDays,
      days: monthDays,
      dayEventsMap: map,
    };
  }, [year, month, events]);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now.getDate());
  };

  // Determine active spotlight event
  const selectedEvent = dayEventsMap.get(selectedDay);
  const spotlightTitle = selectedEvent?.title || featuredEvent?.title || null;
  const spotlightVenue = selectedEvent?.venue || featuredEvent?.venue || "Campus Venue";
  const spotlightCategory = selectedEvent?.category || "Campus Event";
  const spotlightTime = selectedEvent?.starts_at
    ? new Date(selectedEvent.starts_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : featuredEvent?.starts_at
    ? new Date(featuredEvent.starts_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";

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
            const ev = dayEventsMap.get(d);
            const isSel = d === selectedDay;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`day ${isSel ? "selected" : ""} ${ev && !isSel ? "week" : ""}`}
              >
                <span className="day-top">
                  <span
                    className={`day-num ${isWeekend(d) ? "dim" : ""} ${ev ? "red-text" : ""}`}
                  >
                    {d}
                  </span>
                  {ev && <span className={`ev-dot ${isSel ? "big" : ""}`} />}
                </span>
                {ev && (
                  <span className={`ev-tag ${isSel ? "solid-sel" : "red"}`}>
                    {ev.category ? ev.category.slice(0, 7) : "Event"}
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
                  {spotlightCategory}
                </span>
                <span className="chip" style={{ background: "#FFDADA", color: "#40000C" }}>
                  {selectedEvent || featuredEvent ? "Confirmed" : "Open"}
                </span>
              </div>
              <h4>{spotlightTitle || "No scheduled events for this date"}</h4>
            </div>
          </div>
          <button type="button" className="ghost-btn" aria-label="Details">
            <Info size={15} />
          </button>
        </div>

        {spotlightTitle ? (
          <>
            <div className="spot-meta">
              <div>
                <Clock size={15} color="#B80035" />
                <div>
                  <span className="label-sm">Time</span>
                  <p>{spotlightTime}</p>
                </div>
              </div>
              <div>
                <MapPin size={15} color="#B80035" />
                <div>
                  <span className="label-sm">Venue</span>
                  <p>{spotlightVenue}</p>
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

            <div className="spot-foot">
              <div>
                <Info size={15} color="#0050D4" />
                <span className="t-12 muted">Managed via Student Affairs &amp; Council.</span>
              </div>
              <a href="/admin/events-directory" className="soft-btn">
                View in Directory <ChevronRight size={8} />
              </a>
            </div>
          </>
        ) : (
          <div className="py-4 text-center text-xs text-neutral-400">
            Select another calendar date or view the events directory.
          </div>
        )}
      </div>
    </div>
  );
}
