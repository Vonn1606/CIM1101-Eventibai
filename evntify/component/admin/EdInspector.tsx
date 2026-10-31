"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck, MapPin, Eye } from "lucide-react";
import { EventItem } from "@/app/data/events-directory";

export default function EdInspector({
  event,
  onClose,
}: {
  event: EventItem | null;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes("");
  }, [event?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        className={`ed-scrim ${event ? "open" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`ed-drawer ${event ? "open" : ""}`}
        aria-hidden={!event}
        role="dialog"
        aria-label="Event inspector"
      >
        {event && (
          <>
            <header className="ed-drawer-head">
              <div>
                <i className="ed-red-dot" />
                <b>Event Inspector</b>
              </div>
              <button
                className="ed-ghost-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </header>

            <div className="ed-drawer-body">
              <div>
                <div className="ed-label ed-red-text">{event.dept}</div>
                <h3 className="ed-drawer-title">{event.title}</h3>
              </div>

              <div className="ed-metric-strip">
                <div>
                  <div className="ed-label-sm">Verified Capacity</div>
                  <div className="ed-metric-val">
                    {event.registered} / {event.capacity}
                  </div>
                </div>
                <div>
                  <div className="ed-label-sm">Safety Clearance</div>
                  <div className="ed-metric-val ed-green">
                    <ShieldCheck size={16} /> Passed
                  </div>
                </div>
              </div>

              <div className="ed-logistics">
                <div className="ed-t-12-600">Location &amp; Facilities</div>
                <div className="ed-t-12 ed-muted ed-loc">
                  <MapPin size={13} color="#B80035" /> {event.venue}
                </div>
                <div className="ed-fac-grid">
                  {event.facilities.map((f) => (
                    <span key={f} className="ed-t-12 ed-muted">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="ed-t-12-600">Spatial Map Reference</div>
                <div className="ed-map">
                  <i className="ed-pin" />
                  <span className="ed-map-tag">
                    <Eye size={10} /> {event.venue}
                  </span>
                </div>
              </div>

              <label className="ed-notes">
                <span className="ed-label-sm ed-up">
                  Supervisory Field Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Input administrative notes regarding protocol compliance…"
                />
              </label>
            </div>

            <footer className="ed-drawer-foot">
              <button className="ed-btn-outline" onClick={onClose}>
                Dismiss
              </button>
              <button className="ed-btn-danger">Suspend</button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

