"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Lock,
  MapPin,
  Users,
  Save,
  Send,
  Info,
  Image as ImageIcon,
} from "lucide-react";

const CAPACITY_MAX = 300;

/* ---------- Sub-components ---------- */

function CeLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="ce-label">
      <span>{children}</span>
      <em>*</em>
    </div>
  );
}

function CeSectionHeader({
  n,
  title,
  sub,
  tag,
  tagTone,
}: {
  n: number;
  title: string;
  sub: string;
  tag: React.ReactNode;
  tagTone: "rose" | "green";
}) {
  return (
    <div className="ce-sec-head">
      <div className="ce-sec-head-left">
        <span className="ce-sec-num">{n}</span>
        <div>
          <h2>{title}</h2>
          <p>{sub}</p>
        </div>
      </div>
      <span className={`ce-tag ce-tag-${tagTone}`}>{tag}</span>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function CreateEventForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    organization: "LITS",
    department: "College of Computer Studies & Systems",
    venue: "",
    date: "2026-11-15",
    start: "13:00",
    end: "17:00",
    capacity: 300,
  });

  const set = (k: string, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const filled = Math.min(100, Math.round((Number(form.capacity) / CAPACITY_MAX) * 85));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to Supabase insert
    console.log("Submit event", form);
    alert("Event submitted for admin review!");
    router.push("/organizer-dashboard");
  };

  return (
    <form onSubmit={submit} className="ce-form-wrap">

      {/* Header & breadcrumb */}
      <div className="ce-header">
        <nav className="ce-crumbs">
          <a href="/organizer-dashboard">Organizer Dashboard</a>
          <span className="ce-crumbs-sep">/</span>
          <strong className="ce-crumbs-current">Create Event</strong>
        </nav>
        <div className="ce-header-row">
          <div className="ce-header-text">
            <h1>Create Event</h1>
            <p>
              Set up a new campus event. Submissions are reviewed by the
              administration before they are published to students.
            </p>
          </div>
          <span className="ce-status">
            <i className="ce-dot" />
            <b>Draft Status</b>
          </span>
        </div>
      </div>

      <div className="ce-form-body">

        {/* Section 1 — Basic Info */}
        <section className="ce-card">
          <CeSectionHeader
            n={1}
            title="Event Basic Info"
            sub="Name, category and a short overview"
            tag="Required"
            tagTone="rose"
          />
          <div className="ce-grid">
            <div className="ce-field ce-span-2-3">
              <CeLabel>Event Name</CeLabel>
              <input
                className="ce-input"
                placeholder="e.g., LITS Tech Summit 2026: Quantum Horizons"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
              <small>Distinct, academic-appropriate title for official notices</small>
            </div>

            <div className="ce-field ce-span-1-3">
              <CeLabel>Category</CeLabel>
              <div className="ce-select-wrap">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  required
                >
                  <option value="" disabled>Select event category</option>
                  <option>Seminar</option>
                  <option>Workshop</option>
                  <option>Competition</option>
                  <option>Symposium</option>
                  <option>Social</option>
                </select>
                <ChevronDown size={10} className="ce-chev" />
              </div>
            </div>

            <div className="ce-field ce-span-all">
              <div className="ce-label-row">
                <div className="ce-label">
                  <span>Event Description</span>
                  <em>*</em>
                </div>
                <small>Visible to all students</small>
              </div>
              <textarea
                className="ce-input ce-textarea"
                placeholder="Outline the event's syllabus, notable speakers, attendee eligibility criteria, and preparation expectations..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Section 2 — Host Society & Department */}
        <section className="ce-card">
          <CeSectionHeader
            n={2}
            title="Host Society & Department"
            sub="Who is organizing this event"
            tag={<><Lock size={10} /> Pre-filled</>}
            tagTone="green"
          />
          <div className="ce-grid-two">
            <div className="ce-field">
              <CeLabel>Organization</CeLabel>
              <div className="ce-select-wrap">
                <select
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                >
                  <option>LITS</option>
                  <option>CCS Student Council</option>
                  <option>ACM Chapter</option>
                </select>
                <ChevronDown size={14} className="ce-chev" />
              </div>
            </div>

            <div className="ce-field">
              <CeLabel>Academic Department</CeLabel>
              <div className="ce-select-wrap">
                <select
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                >
                  <option>College of Computer Studies &amp; Systems</option>
                  <option>College of Engineering</option>
                  <option>College of Business</option>
                </select>
                <ChevronDown size={14} className="ce-chev" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Schedule & Logistics */}
        <section className="ce-card">
          <CeSectionHeader
            n={3}
            title="Schedule & Logistics"
            sub="Venue, date, time and capacity"
            tag="Required"
            tagTone="rose"
          />
          <div className="ce-grid">
            <div className="ce-field ce-span-all">
              <CeLabel>Venue Selection</CeLabel>
              <div className="ce-select-wrap">
                <select
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  required
                >
                  <option value="" disabled>Select an approved campus venue...</option>
                  <option>Main Auditorium</option>
                  <option>Innovation Hall</option>
                  <option>Computer Lab 3</option>
                  <option>Tan Yan Kee Conference Hall</option>
                </select>
                <MapPin size={14} className="ce-chev" />
              </div>
              <small className="ce-hint">
                <i className="ce-dot" /> Only approved campus venues are shown
              </small>
            </div>

            <div className="ce-field ce-span-1-3">
              <CeLabel>Date</CeLabel>
              <input
                type="date"
                className="ce-input"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
              <small>Minimum 7 days buffer for approval</small>
            </div>

            <div className="ce-field ce-span-1-3">
              <CeLabel>Start Time</CeLabel>
              <input
                type="time"
                className="ce-input"
                value={form.start}
                onChange={(e) => set("start", e.target.value)}
                required
              />
              <small>Call time / Doors open</small>
            </div>

            <div className="ce-field ce-span-1-3">
              <CeLabel>End Time</CeLabel>
              <input
                type="time"
                className="ce-input"
                value={form.end}
                onChange={(e) => set("end", e.target.value)}
                required
              />
              <small>Building egress cutoff</small>
            </div>

            <div className="ce-field ce-span-half">
              <CeLabel>Target Capacity (Attendees)</CeLabel>
              <input
                type="number"
                min={1}
                className="ce-input"
                value={form.capacity}
                onChange={(e) => set("capacity", Number(e.target.value))}
                required
              />
              <small>RSVP capping triggers waitlist automatically</small>
            </div>

            <div className="ce-meter ce-span-half">
              <div className="ce-meter-top">
                <span>Capacity Preview</span>
                <b>{form.capacity} seats</b>
              </div>
              <div className="ce-bar">
                <div className="ce-bar-fill" style={{ width: `${filled}%` }} />
              </div>
              <div className="ce-meter-bottom">
                <span>
                  <Users size={12} /> Venue seating checked on submit
                </span>
                <span>{filled}% filled</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — Live Preview Strip */}
        <section className="ce-preview">
          <div className="ce-preview-date">
            <span>Nov</span>
            <ImageIcon size={16} color="#fff" />
          </div>
          <div className="ce-preview-body">
            <div className="ce-preview-tags">
              <span className="ce-chip">{form.category || "Category"}</span>
              <span className="ce-live">Live preview</span>
            </div>
            <h3>{form.name || "Your event name will appear here"}</h3>
            <div className="ce-preview-meta">
              <span>{form.venue || "Venue"}</span>
              <span>•</span>
              <span>{form.start} – {form.end}</span>
            </div>
          </div>
        </section>

        {/* Action bar */}
        <div className="ce-actions">
          <span className="ce-actions-info">
            <Info size={12} />
          </span>
          <div className="ce-actions-btns">
            <button
              type="button"
              className="ce-btn ce-btn-ghost"
              onClick={() => router.push("/organizer-dashboard")}
            >
              Cancel
            </button>
            <button type="button" className="ce-btn ce-btn-soft">
              <Save size={12} /> Save as Draft
            </button>
            <button type="submit" className="ce-btn ce-btn-primary">
              Submit Event <Send size={12} />
            </button>
          </div>
        </div>

      </div>
    </form>
  );
}

