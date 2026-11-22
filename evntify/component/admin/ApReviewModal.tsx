"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  CalendarDays,
  MapPin,
  Users,
  UserRound,
  ShieldCheck,
  ClipboardList,
  FileText,
  Paperclip,
  Eye,
  ArrowLeft,
  Undo2,
  Ban,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Proposal, TONES } from "@/types/admin";

type Act = "approved" | "returned" | "declined";

export default function ApReviewModal({
  p,
  onClose,
  onDecide,
}: {
  p: Proposal;
  onClose: () => void;
  onDecide: (id: string, d: Act, notes?: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const t = TONES[p.tone];
  const pct = Math.round((p.seatsExpected / p.seatsTotal) * 100);

  const handleAction = (d: Act) => {
    if ((d === "returned" || d === "declined") && !decisionNotes.trim()) {
      setValidationError(
        `A review note is required when ${d === "returned" ? "returning for edits" : "declining"}.`
      );
      return;
    }
    setValidationError(null);
    onDecide(p.id, d, decisionNotes.trim() ? decisionNotes.trim() : undefined);
  };

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="rv-scrim" onClick={onClose}>
      <div
        className="rv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rv-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="rv-mh">
          <div>
            <div className="rv-mchips">
              <span className="chip upper soft">{p.dept}</span>
              <span className="chip tint">{p.org}</span>
              <span className="submitted">
                <Clock size={12} />
                {p.submitted}
              </span>
              <span className="chip stage-soft">
                <i />
                {p.stage}
              </span>
            </div>
            <h2 id="rv-title">{p.title}</h2>
            <p>
              {p.when} · {p.venue}
            </p>
          </div>
          <button
            ref={closeRef}
            className="rv-x"
            onClick={onClose}
            aria-label="Close review"
            type="button"
          >
            <X size={13} />
          </button>
        </header>

        <div className="rv-mb">
          <div className="rv-grid2">
            <div className="rv-box">
              <span className="rv-ico">
                <CalendarDays size={18} color="#E11D48" />
              </span>
              <div>
                <div className="label brown">Date &amp; time</div>
                <b>{p.date}</b>
                <small>{p.when}</small>
              </div>
            </div>
            <div className="rv-box">
              <span className="rv-ico">
                <MapPin size={18} color="#5C3F40" />
              </span>
              <div>
                <div className="label brown">Venue &amp; location</div>
                <b>{p.venue}</b>
                <small>{p.venueNote || "Campus Location"}</small>
              </div>
            </div>
          </div>

          <div className="rv-grid3">
            <div className="rv-box s">
              <Users size={18} color="#B80035" />
              <div>
                <div className="label-sm">Expected attendance</div>
                <b>{p.attendance.replace(" expected attendees", "")} guests</b>
                <small>
                  {pct}% of {p.seatsTotal} seats
                </small>
              </div>
            </div>
            <div className="rv-box s">
              <UserRound size={18} color="#B80035" />
              <div>
                <div className="label-sm">Organizer contact</div>
                <b>{p.contact}</b>
                <small>{p.contactEmail}</small>
              </div>
            </div>
            <div className="rv-box s">
              <ShieldCheck size={18} color="#B80035" />
              <div>
                <div className="label-sm">Venue clearance</div>
                <b>{p.clearance}</b>
                <small className="ok">{p.clearanceNote}</small>
              </div>
            </div>
          </div>

          {p.revision && p.revision > 1 && (
            <div className="rv-diff-box">
              <div className="rv-diff-header">
                <span className="rv-diff-badge">
                  <ShieldCheck size={12} />
                  Resubmitted · Revision v{p.revision}
                </span>
                {p.resubmittedAt && (
                  <span className="label-sm">
                    {new Date(p.resubmittedAt).toLocaleString("en-US", { timeZone: "Asia/Manila" })}
                  </span>
                )}
              </div>

              {p.changes && Object.keys(p.changes).length > 0 ? (
                <table className="rv-diff-table">
                  <thead>
                    <tr>
                      <th>Modified Field</th>
                      <th>Previous Value</th>
                      <th>Resubmitted Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(p.changes).map(([field, diff]) => (
                      <tr key={field}>
                        <td style={{ fontWeight: 600 }}>{field}</td>
                        <td>
                          <span className="rv-diff-old">
                            {String(diff.from || "—")}
                          </span>
                        </td>
                        <td>
                          <span className="rv-diff-new">
                            {String(diff.to || "—")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="t-12 muted">Details updated by organizer without major field changes.</p>
              )}

              <div className="rv-diff-notes">
                {p.previousNote && (
                  <div>
                    <span className="label-sm" style={{ color: "#B80035" }}>You requested earlier:</span>
                    <p style={{ fontStyle: "italic", color: "#555", marginTop: 2 }}>
                      &ldquo;{p.previousNote}&rdquo;
                    </p>
                  </div>
                )}
                {p.clearanceNote && (
                  <div>
                    <span className="label-sm">Organizer note:</span>
                    <p style={{ color: "#222", marginTop: 2 }}>
                      {p.clearanceNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <section className="rv-brief">
            <h3>
              <ClipboardList size={16} color="#B80035" /> Event overview
            </h3>
            <p>{p.brief}</p>
          </section>

          <section className="rv-docs">
            <div className="rv-docs-head">
              <h3>
                <Paperclip size={16} color="#0050D4" /> Submitted documentation
                &amp; endorsements
              </h3>
              <span className="label-sm">{p.documents.length} attached</span>
            </div>
            {p.documents.map((d) => (
              <div key={d.name} className="rv-doc">
                <span className="rv-ico sm">
                  <FileText size={16} color="#E11D48" />
                </span>
                <div>
                  <b>{d.name}</b>
                  <small>{d.meta}</small>
                </div>
                <a href="#" className="rv-preview" onClick={(e) => e.preventDefault()}>
                  <Eye size={11} /> Preview file
                </a>
              </div>
            ))}
          </section>
        </div>

        <footer className="rv-mf">
          <div className="w-full mb-3">
            <label className="block text-xs font-semibold text-[#5A4B48] mb-1">
              Reviewer Notes / Feedback {p.status === "pending" ? "(Required for return or decline)" : ""}
            </label>
            <textarea
              value={decisionNotes}
              onChange={(e) => {
                setDecisionNotes(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Add feedback, required corrections, or reasons for decision..."
              className="w-full text-xs p-2.5 rounded-lg border border-[#E4D9D2] bg-white focus:outline-none focus:border-[#651C32] text-[#1E1B19] resize-none h-16"
            />
            {validationError && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{validationError}</p>
            )}
          </div>
          <div className="flex items-center justify-between w-full">
            <button type="button" className="rv-back" onClick={onClose}>
              <ArrowLeft size={12} /> Back to proposals
            </button>
            <div className="rv-acts">
              <button
                type="button"
                className="rv-amber"
                onClick={() => handleAction("returned")}
              >
                <Undo2 size={15} color="#D97706" /> Return for edits
              </button>
              <button
                type="button"
                className="rv-decline"
                onClick={() => handleAction("declined")}
              >
                <Ban size={15} /> Decline event
              </button>
              <button
                type="button"
                className="rv-approve"
                style={{ outlineColor: t.fg }}
                onClick={() => handleAction("approved")}
              >
                <CheckCircle2 size={15} /> Approve &amp; issue permit
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
