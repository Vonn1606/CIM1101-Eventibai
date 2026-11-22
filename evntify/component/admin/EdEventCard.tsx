import {
  Zap,
  CalendarClock,
  CheckCircle2,
  MapPin,
  UserCheck,
  ChevronRight,
  Building2,
  CalendarDays,
} from "lucide-react";
import {
  EventItem,
  STATUS_LABEL,
  STATUS_COLOR,
  capacityTone,
  pct,
} from "@/types/admin";

const AVATAR_BG = ["#DDE9FF", "#FFDADA", "#DAE2FD"];
const AVATAR_FG = ["#0D1C2F", "#40000C", "#131B2E"];

export default function EdEventCard({
  event,
  onInspect,
}: {
  event: EventItem;
  onInspect: (e: EventItem) => void;
}) {
  const done = event.status === "completed";
  const p = pct(event);
  const tone = done
    ? { bar: "#565E74", text: "#565E74", label: "Final attendance" }
    : capacityTone(p);
  const Icon =
    event.status === "ongoing"
      ? Zap
      : done
      ? CheckCircle2
      : CalendarClock;

  return (
    <article
      className={`ed-ev-card ${done ? "done" : ""}`}
      style={{ ["--accent" as string]: event.accent }}
    >
      <div className="ed-ev-banner" style={{ background: event.banner }}>
        <div className="ed-ev-shade" />
        <div className="ed-ev-badges">
          <span
            className="ed-status-badge"
            style={{
              background: STATUS_COLOR[event.status],
              color: done ? "#565E74" : "#fff",
            }}
          >
            {event.status === "ongoing" ? (
              <i className="ed-pulse" />
            ) : (
              <Icon size={11} />
            )}
            {STATUS_LABEL[event.status]}
          </span>
          <span className="ed-dept-badge">
            <Building2 size={11} color="#0050D4" />
            {event.collegeShort || event.dept.split(" ")[0]}
          </span>
        </div>
        <div className="ed-ev-overlay">
          <span className="ed-org-pill">{event.org}</span>
          <span className="ed-reg-count">
            <UserCheck size={11} />
            {event.registered}
          </span>
        </div>
      </div>

      <div className="ed-ev-body">
        <div>
          <h2 className="ed-ev-title">{event.title}</h2>
          <p className="ed-ev-blurb">{event.blurb}</p>
        </div>

        <div className="ed-ev-details">
          <div>
            <CalendarDays size={15} color="#B80035" />
            <span className="ed-t-12-600">{event.date}</span>
          </div>
          <div>
            <MapPin size={14} color="#565E74" />
            <span className="ed-t-12 ed-muted">{event.venue}</span>
          </div>
        </div>

        <div className="ed-cap">
          <div className="ed-cap-row">
            <span className="ed-label-sm">
              {done
                ? "Final attendance"
                : `${event.registered} / ${event.capacity} registered`}
            </span>
            <span className="ed-label-sm" style={{ color: tone.text }}>
              {done ? "Complete" : `${p}%${p >= 95 ? " Full" : ""}`}
            </span>
          </div>
          <div className="ed-bar ed-bar-lg">
            <span
              style={{
                width: `${Math.min(p, 100)}%`,
                background: tone.bar,
              }}
            />
          </div>
        </div>

        <div className="ed-ev-cta">
          {done ? (
            <span className="ed-done-note">
              <CheckCircle2 size={14} color="#059669" /> Report filed
            </span>
          ) : (
            <div className="ed-avatars">
              {event.people.map((n, i) => (
                <span
                  key={n}
                  style={{
                    background: AVATAR_BG[i % 3],
                    color: AVATAR_FG[i % 3],
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          )}
          <button className="ed-soft-btn ed-soft-btn-lg" onClick={() => onInspect(event)}>
            Inspect <ChevronRight size={12} />
          </button>
        </div>
      </div>
      <span className="ed-ev-stripe" />
    </article>
  );
}

