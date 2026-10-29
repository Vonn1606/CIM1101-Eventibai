"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Users, Info } from "lucide-react";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// November 2025 starts on a Saturday, so 5 leading blanks (Mon-Fri)
const LEADING = [27, 28, 29, 30, 31];
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

const events: Record<number, { tag: string; tone: "red" | "blue" | "solid" }> = {
  5: { tag: "Seminar", tone: "red" },
  12: { tag: "Mixer", tone: "blue" },
  15: { tag: "Gala", tone: "blue" },
  20: { tag: "Expo", tone: "red" },
  25: { tag: "Eng. Week", tone: "solid" },
  28: { tag: "Summit", tone: "solid" },
};
const weekend = new Set([2, 9, 16, 23, 30]);

export default function Calendar() {
  const [selected, setSelected] = useState(28);

  return (
    <div className="col-left">
      <div className="card cal">
        <div className="cal-head">
          <div className="cal-title">
            <span className="sq-btn"><CalendarDays size={16} color="#B80035" /></span>
            <h3>November 2025</h3>
          </div>
          <div className="cal-nav">
            <button aria-label="Previous month"><ChevronLeft size={10} /></button>
            <button aria-label="Next month"><ChevronRight size={10} /></button>
            <span className="today">Today</span>
          </div>
        </div>

        <div className="dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>

        <div className="days">
          {LEADING.map((d) => (
            <div key={`p${d}`} className="day prev">{d}</div>
          ))}
          {DAYS.map((d) => {
            const ev = events[d];
            const isSel = d === selected;
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={`day ${isSel ? "selected" : ""} ${ev?.tone === "solid" && !isSel ? "week" : ""}`}
              >
                <span className="day-top">
                  <span className={`day-num ${weekend.has(d) ? "dim" : ""} ${ev ? "red-text" : ""}`}>{d}</span>
                  {ev && <span className={`ev-dot ${isSel ? "big" : ""}`} />}
                </span>
                {ev && <span className={`ev-tag ${isSel ? "solid-sel" : ev.tone}`}>{ev.tag}</span>}
              </button>
            );
          })}
        </div>

        <div className="legend">
          <div className="legend-items">
            <span><i style={{ background: "#E11D48" }} /> Admin event</span>
            <span><i style={{ background: "#0050D4" }} /> Org event</span>
          </div>
        </div>
      </div>

      <div className="card spotlight">
        <div className="spot-head">
          <div className="spot-left">
            <div className="date-chip"><small>Nov</small><b>{selected}</b></div>
            <div>
              <div className="chips">
                <span className="chip" style={{ background: "#DAE2FD", color: "#131B2E" }}>Student Affairs</span>
                <span className="chip" style={{ background: "#FFDADA", color: "#40000C" }}>Approved</span>
              </div>
              <h4>LITS Tech Innovation Summit 2025</h4>
            </div>
          </div>
          <button className="ghost-btn" aria-label="Details"><Info size={15} /></button>
        </div>

        <div className="spot-meta">
          <div><Clock size={15} color="#B80035" /><div><span className="label-sm">Time</span><p>9:00 AM to 5:00 PM</p></div></div>
          <div><MapPin size={15} color="#B80035" /><div><span className="label-sm">Venue</span><p>Grand Hall</p></div></div>
          <div><Users size={15} color="#B80035" /><div><span className="label-sm">Capacity</span><p>500 attendees</p></div></div>
        </div>

        <div className="spot-foot">
          <div><Info size={15} color="#0050D4" /><span className="t-12 muted">Registration closes 48 hours before the event.</span></div>
          <button className="soft-btn">View details <ChevronRight size={8} /></button>
        </div>
      </div>
    </div>
  );
}
