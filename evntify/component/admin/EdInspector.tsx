"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck, MapPin, Eye } from "lucide-react";
import { EventItem } from "@/types/admin";
import {
  saveAdminNote,
  suspendEvent,
  getEventFacilities,
  getEventAdminNotes,
} from "@/app/actions/admin";

export default function EdInspector({
  event,
  onClose,
}: {
  event: EventItem | null;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Array<{ label: string; value: string }>>([]);
  const [savedNotes, setSavedNotes] = useState<Array<{ id: string; note: string; createdAt: string }>>([]);

  // Reset stale state and reload data whenever the selected event changes.
  // Moved from render body into useEffect to avoid setState-during-render.
  useEffect(() => {
    setNotes("");
    setFeedback(null);
    setFacilities([]);
    setSavedNotes([]);
    if (event?.id) {
      getEventFacilities(event.id)
        .then((facs) => setFacilities(facs))
        .catch(() => setFacilities([]));
      getEventAdminNotes(event.id)
        .then((notesList) => setSavedNotes(notesList))
        .catch(() => setSavedNotes([]));
    }
  }, [event?.id]);

  const handleSaveNote = async () => {
    if (!event || !notes.trim()) return;
    setSavingNote(true);
    const res = await saveAdminNote(event.id, notes);
    setSavingNote(false);
    if (res.error) {
      setFeedback(`Error: ${res.error}`);
    } else {
      setFeedback("Note saved successfully.");
      const updatedNotes = await getEventAdminNotes(event.id);
      setSavedNotes(updatedNotes);
      setNotes("");
    }
  };

  const handleSuspend = async () => {
    if (!event) return;
    const confirm = window.confirm(`Are you sure you want to suspend "${event.title}"?`);
    if (!confirm) return;

    setSuspending(true);
    const res = await suspendEvent(event.id, notes || undefined);
    setSuspending(false);
    if (res.error) {
      setFeedback(`Suspension failed: ${res.error}`);
    } else {
      setFeedback("Event suspended.");
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

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
                  {facilities.length > 0 ? (
                    facilities.map((f, i) => (
                      <span key={i} className="ed-t-12 ed-muted">
                        {f.label}: {f.value}
                      </span>
                    ))
                  ) : (
                    event.facilities.map((f) => (
                      <span key={f} className="ed-t-12 ed-muted">
                        {f}
                      </span>
                    ))
                  )}
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

              <div className="ed-notes">
                <span className="ed-label-sm ed-up">
                  Supervisory Field Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Input administrative notes regarding protocol compliance…"
                />
                <div className="flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={savingNote || !notes.trim()}
                    className="ed-btn-outline text-xs px-3 py-1 cursor-pointer"
                  >
                    {savingNote ? "Saving..." : "Save Note"}
                  </button>
                  {feedback && (
                    <span className="text-xs text-amber-600 font-medium">{feedback}</span>
                  )}
                </div>

                {savedNotes.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Recent Notes</span>
                    {savedNotes.map((sn) => (
                      <div key={sn.id} className="text-xs bg-neutral-50 p-2 rounded border border-neutral-100">
                        <p className="text-neutral-700">{sn.note}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{sn.createdAt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <footer className="ed-drawer-foot">
              <button className="ed-btn-outline" onClick={onClose}>
                Dismiss
              </button>
              <button
                className="ed-btn-danger"
                onClick={handleSuspend}
                disabled={suspending}
              >
                {suspending ? "Suspending..." : "Suspend"}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

