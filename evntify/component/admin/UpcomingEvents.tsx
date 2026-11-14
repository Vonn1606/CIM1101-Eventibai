import { ListChecks, MapPin, Users, ArrowRight, Wrench } from "lucide-react";
import type { UpcomingEventItem } from "@/lib/db/stats";

// Category colour palette (deterministic fallback)
const CAT_STYLES: Record<string, { bg: string; fg: string }> = {
  Technology:  { bg: "#FFDADA", fg: "#40000C" },
  Science:     { bg: "#DAE2FD", fg: "#131B2E" },
  Arts:        { bg: "#DBE1FF", fg: "#00174B" },
  Business:    { bg: "#DAE2FD", fg: "#131B2E" },
  Sports:      { bg: "#D9F5E3", fg: "#0A3320" },
  Cultural:    { bg: "#FFF3DA", fg: "#3B2300" },
};

function catStyle(cat: string | null) {
  if (cat && CAT_STYLES[cat]) return CAT_STYLES[cat];
  return { bg: "#E8E8F0", fg: "#20203A" };
}

function formatDate(iso: string | null): string {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface UpcomingEventsProps {
  events?: UpcomingEventItem[];
}

export default function UpcomingEvents({ events = [] }: UpcomingEventsProps) {
  const hasEvents = events.length > 0;

  return (
    <div className="col-right">
      <div className="card upcoming">
        <div className="up-head">
          <div className="up-title">
            <span className="sq-btn sm"><ListChecks size={15} color="#0050D4" /></span>
            <div>
              <h3>Upcoming Across Departments</h3>
              <p className="t-12 muted">
                {hasEvents ? `${events.length} scheduled event${events.length > 1 ? "s" : ""}` : "No upcoming events"}
              </p>
            </div>
          </div>
          <span className="pill">Live</span>
        </div>

        <div className="event-list">
          {hasEvents ? (
            events.map((e) => {
              const cs = catStyle(e.category);
              return (
                <article key={e.id} className="event">
                  <div className="event-top">
                    <div>
                      <div className="chips">
                        <span className="chip" style={{ background: cs.bg, color: cs.fg }}>
                          {e.category ?? "General"}
                        </span>
                        <span className="label-sm">{e.venue}</span>
                      </div>
                      <h4>{e.title}</h4>
                    </div>
                    <span className="date-tag" style={{ color: "#565E74" }}>
                      {formatDate(e.starts_at)}
                    </span>
                  </div>
                  <div className="event-meta">
                    <span><MapPin size={13} /> {e.venue}</span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-neutral-400">
              No upcoming events scheduled across departments.
            </div>
          )}
        </div>

        <a href="/admin/events-directory" className="all-link">View all events <ArrowRight size={11} /></a>
      </div>

      <div className="card mini-status">
        <div className="mini-left">
          <span className="mini-icon"><Wrench size={15} color="#0050D4" /></span>
          <div>
            <div className="t-12-600">Venue Operations</div>
            <div className="t-12 muted">All campus halls and facilities operational</div>
          </div>
        </div>
        <span className="pill" style={{ background: "#E5F7F0", color: "#0E6245" }}>Normal</span>
      </div>
    </div>
  );
}
