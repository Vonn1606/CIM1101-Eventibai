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

// Hardcoded fallback items
const FALLBACK_ITEMS = [
  { cat: "Technology", owner: "OSA", title: "LITS Tech Innovation Summit 2025", date: "Nov 28", place: "Grand Hall", seats: "500 seats", pct: 91.59, color: "#8B263E", dateFg: "#B80035" },
  { cat: "Science", owner: "College of Science", title: "BioTech Research Showcase", date: "Dec 03", place: "Lab Atrium", seats: "180 seats", pct: 77.79, color: "#2F6AF2", dateFg: "#565E74" },
  { cat: "Arts", owner: "Fine Arts", title: "Fine Arts Exhibition", date: "Dec 08", place: "Gallery East", seats: "120 seats", pct: 73.3, color: "#2F6AF2", dateFg: "#565E74" },
  { cat: "Business", owner: "Business School", title: "Business Case Competition", date: "Dec 14", place: "Hall B", seats: "300 seats", pct: 100, color: "#8B263E", dateFg: "#565E74" },
];

interface UpcomingEventsProps {
  events?: UpcomingEventItem[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const useDB = events && events.length > 0;

  return (
    <div className="col-right">
      <div className="card upcoming">
        <div className="up-head">
          <div className="up-title">
            <span className="sq-btn sm"><ListChecks size={15} color="#0050D4" /></span>
            <div>
              <h3>Upcoming Across Departments</h3>
              <p className="t-12 muted">Next {useDB ? events!.length : FALLBACK_ITEMS.length} scheduled events</p>
            </div>
          </div>
          <span className="pill">Live</span>
        </div>

        <div className="event-list">
          {useDB
            ? events!.map((e) => {
                const cs = catStyle(e.category);
                return (
                  <article key={e.id} className="event">
                    <div className="event-top">
                      <div>
                        <div className="chips">
                          <span className="chip" style={{ background: cs.bg, color: cs.fg }}>{e.category ?? "General"}</span>
                          <span className="label-sm">{e.venue}</span>
                        </div>
                        <h4>{e.title}</h4>
                      </div>
                      <span className="date-tag" style={{ color: "#565E74" }}>{formatDate(e.starts_at)}</span>
                    </div>
                    <div className="event-meta">
                      <span><MapPin size={13} /> {e.venue}</span>
                    </div>
                  </article>
                );
              })
            : FALLBACK_ITEMS.map((e) => (
                <article key={e.title} className="event">
                  <div className="event-top">
                    <div>
                      <div className="chips">
                        <span className="chip" style={{ background: catStyle(e.cat).bg, color: catStyle(e.cat).fg }}>{e.cat}</span>
                        <span className="label-sm">{e.owner}</span>
                      </div>
                      <h4>{e.title}</h4>
                    </div>
                    <span className="date-tag" style={{ color: e.dateFg }}>{e.date}</span>
                  </div>
                  <div className="event-meta">
                    <span><MapPin size={13} /> {e.place}</span>
                    <span><Users size={13} /> {e.seats}</span>
                  </div>
                  <div className="cap">
                    <div className="cap-row">
                      <span className="label-sm">Capacity</span>
                      <span className="label-sm" style={{ color: e.pct >= 90 ? "#B80035" : "#565E74" }}>{Math.round(e.pct)}%</span>
                    </div>
                    <div className="bar"><span style={{ width: `${e.pct}%`, background: e.color }} /></div>
                  </div>
                </article>
              ))}
        </div>

        <a href="#" className="all-link">View all events <ArrowRight size={11} /></a>
      </div>

      <div className="card mini-status">
        <div className="mini-left">
          <span className="mini-icon"><Wrench size={15} color="#B80035" /></span>
          <div>
            <div className="t-12-600">Venue maintenance</div>
            <div className="t-12 muted">Hall B closed Dec 20 to 22</div>
          </div>
        </div>
        <span className="pill red">Pending</span>
      </div>
    </div>
  );
}
