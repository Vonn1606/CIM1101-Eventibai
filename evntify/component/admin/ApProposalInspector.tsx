import {
  X,
  MapPin,
  TriangleAlert,
  ShieldCheck,
  CheckCircle2,
  Undo2,
  Ban,
  ClipboardCheck,
} from "lucide-react";
import { Proposal } from "@/app/data/proposals";

type Act = "approved" | "returned" | "declined";

export default function ApProposalInspector({
  p,
  onClose,
  onDecide,
}: {
  p: Proposal | null;
  onClose: () => void;
  onDecide: (id: string, d: Act) => void;
}) {
  if (!p) {
    return (
      <aside className="inspector empty-ins">
        <ClipboardCheck size={22} />
        <b>No proposal selected</b>
        <span className="t-12 muted-brown">
          Choose “Review proposal” on a card to inspect it and sign off.
        </span>
      </aside>
    );
  }
  const pct = Math.round((p.seatsExpected / p.seatsTotal) * 100);
  const green = Math.min(pct, 75);
  const amber = Math.max(0, Math.min(pct, 100) - 75);
  const warn = pct >= 80;
  const open = p.status === "pending";

  return (
    <aside className="inspector">
      <header className="ins-head">
        <div>
          <div className="label red-text">Proposal inspector</div>
          <h3>{p.title}</h3>
        </div>
        <button
          type="button"
          className="ghost-btn"
          onClick={onClose}
          aria-label="Close inspector"
        >
          <X size={14} />
        </button>
      </header>

      <div className="ins-visual" style={{ background: p.banner }}>
        <div className="ins-shade">
          <span className="ins-venue">
            <MapPin size={11} />
            {p.venue}
          </span>
          <span className="ins-risk">{p.risk}</span>
        </div>
      </div>

      <div className="ins-cap">
        <div className="cap-row">
          <span className="label-sm">Venue capacity use</span>
          <span className="label-sm dark">
            {p.seatsExpected} / {p.seatsTotal}
          </span>
        </div>
        <div className="seg-bar">
          <span style={{ width: `${green}%`, background: "#10B981" }} />
          <span style={{ width: `${amber}%`, background: "#F59E0B" }} />
        </div>
        <div className="cap-note">
          {warn ? (
            <TriangleAlert size={12} color="#D97706" />
          ) : (
            <ShieldCheck size={12} color="#059669" />
          )}
          <span className="t-12 muted-brown">{p.capacityNote}</span>
        </div>
      </div>

      <div>
        <div className="label-sm up">Executive proposal brief</div>
        <p className="ins-brief">{p.brief}</p>
      </div>

      <div>
        <div className="label-sm up">Submitted endorsements</div>
        <div className="endorse">
          {p.endorsements.map((e) => (
            <div key={e}>
              <CheckCircle2 size={14} color="#059669" />
              <span className="t-12">{e}</span>
              <a
                href="#"
                className="view"
                onClick={(ev) => ev.preventDefault()}
              >
                View
              </a>
            </div>
          ))}
        </div>
      </div>

      {open ? (
        <div className="ins-actions">
          <button
            type="button"
            className="act-primary"
            onClick={() => onDecide(p.id, "approved")}
          >
            <CheckCircle2 size={16} /> Approve &amp; issue permit
          </button>
          <div>
            <button
              type="button"
              className="act-amber"
              onClick={() => onDecide(p.id, "returned")}
            >
              <Undo2 size={13} color="#B45309" /> Return for edits
            </button>
            <button
              type="button"
              className="act-danger"
              onClick={() => onDecide(p.id, "declined")}
            >
              <Ban size={14} /> Decline
            </button>
          </div>
        </div>
      ) : (
        <div className="decided">Marked as {p.status}.</div>
      )}

      <footer className="ins-audit">
        <span>{p.submittedBy}</span>
        <span>{p.updated}</span>
      </footer>
    </aside>
  );
}

