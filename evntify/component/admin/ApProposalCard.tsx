import {
  Clock,
  CalendarDays,
  MapPin,
  Users,
  FileText,
  ShieldCheck,
  TriangleAlert,
  ChevronRight,
} from "lucide-react";
import { Proposal, TONES } from "@/app/data/proposals";

export default function ApProposalCard({
  p,
  selected,
  onSelect,
}: {
  p: Proposal;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = TONES[p.tone];
  const s = TONES[p.stageTone];
  const c = TONES[p.checkTone];
  const CheckIcon = p.checkTone === "amber" ? TriangleAlert : ShieldCheck;

  return (
    <article
      className={`pcard ${selected ? "selected" : ""}`}
      style={{ ["--stripe" as string]: t.stripe }}
    >
      <span className="pstripe" />
      <div className="pcard-top">
        <div className="pchips">
          <span className="chip upper" style={{ background: t.bg, color: t.fg }}>
            {p.dept}
          </span>
          <span className="submitted">
            <Clock size={12} />
            {p.submitted}
          </span>
          <span className="chip tint">{p.org}</span>
        </div>
        <span className="stage" style={{ background: s.bg, color: s.fg }}>
          <i style={{ background: s.fg }} />
          {p.stage}
        </span>
      </div>

      <div>
        <h2 className="ptitle">{p.title}</h2>
        <p className="psub">
          <b>{p.org}</b>
          <span>/</span>
          {p.when}
        </p>
      </div>

      <div className="pfacts">
        <div>
          <CalendarDays size={16} color={t.fg} />
          <span>
            <small>Proposed date</small>
            {p.date}
          </span>
        </div>
        <div>
          <MapPin size={16} color={t.fg} />
          <span>
            <small>Venue</small>
            {p.venue}
          </span>
        </div>
        <div>
          <Users size={16} color={t.fg} />
          <span>
            <small>Attendance</small>
            {p.attendance}
          </span>
        </div>
      </div>

      <div className="pfoot">
        <div className="tags">
          <span className="tag">
            <FileText size={12} color="#0050D4" />
            {p.docs}
          </span>
          <span
            className="tag"
            style={{
              background: p.checkTone === "amber" ? "#FFFBEB" : "#ECFDF5",
              color: c.fg,
            }}
          >
            <CheckIcon size={13} />
            {p.check}
          </span>
        </div>
        <button
          type="button"
          className="link-btn"
          style={{
            color:
              p.tone === "green"
                ? "#047857"
                : p.tone === "blue"
                ? "#0050D4"
                : p.tone === "amber"
                ? "#0D1C2F"
                : "#B80035",
          }}
          onClick={onSelect}
        >
          Review proposal <ChevronRight size={12} />
        </button>
      </div>
    </article>
  );
}

