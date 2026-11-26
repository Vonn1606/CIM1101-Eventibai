"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Lock,
  MapPin,
  Users,
  Send,
  Info,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { submitEvent } from "@/app/actions/events";

export type VenueOption = {
  id: string;
  name: string;
  capacity: number;
  details: string | null;
};

export type CollegeOption = {
  id: string;
  name: string;
  code?: string | null;
};

export type OrgOption = {
  id: string;
  name: string;
  dept_label: string | null;
  college_id?: string | null;
};

interface CreateEventFormProps {
  venues?: VenueOption[];
  colleges?: CollegeOption[];
  organizations?: OrgOption[];
  defaultOrganizationId?: string;
  defaultCollegeId?: string;
}

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

function getFutureIsoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

/* ---------- Main component ---------- */

export default function CreateEventForm({
  venues = [],
  colleges = [],
  organizations = [],
  defaultOrganizationId,
  defaultCollegeId,
}: CreateEventFormProps) {
  const router = useRouter();

  const [minEventDate] = useState(() => getFutureIsoDate(7));

  const initialOrgId = defaultOrganizationId ?? organizations[0]?.id ?? "";
  const initialOrgCollegeId =
    organizations.find((o) => o.id === initialOrgId)?.college_id ?? defaultCollegeId ?? "";

  const [form, setForm] = useState(() => ({
    name: "",
    category: "Seminar" as "Seminar" | "Workshop" | "Competition" | "Symposium" | "Social" | "General",
    description: "",
    organizationId: initialOrgId,
    collegeId: initialOrgCollegeId,
    venueId: venues[0]?.id ?? "",
    venue: venues[0]?.name ?? "",
    date: getFutureIsoDate(7),
    start: "13:00",
    end: "17:00",
    registrationDeadline: getFutureIsoDate(5),
    capacity: venues[0]?.capacity ? Math.min(100, venues[0].capacity) : 100,
    tier: "Free RSVP",
    memo: "",
    doorsOpenNote: "Doors open 30 minutes prior to event start. Present digital ticket for entry.",
    coordinatorName: "",
    coordinatorEmail: "",
    coordinatorPhone: "",
    bannerColor: "#6c0c28",
    qrEnabled: true,
  }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVenue = venues.find(
    (v) => v.id === form.venueId || v.name === form.venue
  );
  const maxCapacity = selectedVenue?.capacity ?? 500;

  const set = (k: string, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = e.target.value;
    const found = venues.find((v) => v.id === vId);
    setForm((f) => ({
      ...f,
      venueId: vId,
      venue: found?.name ?? "",
      capacity: found ? Math.min(f.capacity, found.capacity) : f.capacity,
    }));
  };

  const filled = Math.min(
    100,
    Math.round((Number(form.capacity) / maxCapacity) * 100)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Client validation
    if (form.end <= form.start) {
      setError("Event end time must be after the start time.");
      setSubmitting(false);
      return;
    }

    if (form.registrationDeadline && form.registrationDeadline > form.date) {
      setError("Registration deadline cannot be after the event date.");
      setSubmitting(false);
      return;
    }

    const res = await submitEvent({
      title: form.name,
      category: form.category,
      description: form.description,
      organizationId: form.organizationId || undefined,
      collegeId: form.collegeId || undefined,
      venueId: form.venueId || undefined,
      venue: form.venue,
      date: form.date,
      startTime: form.start,
      endTime: form.end,
      registrationDeadline: form.registrationDeadline || undefined,
      capacity: Number(form.capacity),
      tier: form.tier,
      memo: form.memo || undefined,
      doorsOpenNote: form.doorsOpenNote || undefined,
      coordinatorName: form.coordinatorName || undefined,
      coordinatorEmail: form.coordinatorEmail || undefined,
      coordinatorPhone: form.coordinatorPhone || undefined,
      bannerColor: form.bannerColor,
      qrEnabled: form.qrEnabled,
    });

    if (res.error) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    router.push("/organizer-dashboard?created=true");
  };

  const dateMonthStr = (() => {
    try {
      return new Date(form.date).toLocaleDateString("en-US", { month: "short" });
    } catch {
      return "TBD";
    }
  })();

  return (
    <form onSubmit={handleSubmit} className="ce-form-wrap">
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

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

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
                placeholder="e.g., Campus Tech Summit 2026: Quantum Horizons"
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
                  value={form.organizationId}
                  onChange={(e) => {
                    const orgId = e.target.value;
                    const org = organizations.find((o) => o.id === orgId);
                    setForm((f) => ({
                      ...f,
                      organizationId: orgId,
                      collegeId: org?.college_id ?? f.collegeId,
                    }));
                  }}
                >
                  {organizations.length > 0 ? (
                    organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Campus Student Organization</option>
                  )}
                </select>
                <ChevronDown size={14} className="ce-chev" />
              </div>
            </div>

            <div className="ce-field">
              <CeLabel>Academic Department / College</CeLabel>
              <div className="ce-select-wrap">
                <select
                  value={form.collegeId}
                  onChange={(e) => set("collegeId", e.target.value)}
                  required
                >
                  <option value="">Select college...</option>
                  {colleges.length > 0 ? (
                    colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value="">General Academic Department</option>
                  )}
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
                  value={form.venueId}
                  onChange={onVenueChange}
                  required
                >
                  <option value="" disabled>Select an approved campus venue...</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Max {v.capacity} pax)
                    </option>
                  ))}
                </select>
                <MapPin size={14} className="ce-chev" />
              </div>
              <small className="ce-hint">
                <i className="ce-dot" />{" "}
                {selectedVenue?.details
                  ? selectedVenue.details
                  : "Only approved campus venues are shown"}
              </small>
            </div>

            <div className="ce-field ce-span-1-3">
              <CeLabel>Date</CeLabel>
              <input
                type="date"
                className="ce-input"
                value={form.date}
                min={minEventDate}
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

            <div className="ce-field ce-span-1-3">
              <CeLabel>Registration Deadline</CeLabel>
              <input
                type="date"
                className="ce-input"
                value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)}
                max={form.date}
              />
              <small>Cutoff before event starts</small>
            </div>

            <div className="ce-field ce-span-1-3">
              <CeLabel>Access Tier</CeLabel>
              <div className="ce-select-wrap">
                <select
                  value={form.tier}
                  onChange={(e) => set("tier", e.target.value)}
                  required
                >
                  <option value="Free RSVP">Free RSVP</option>
                  <option value="Tiered RSVP">Tiered RSVP</option>
                  <option value="Ticketed">Ticketed</option>
                  <option value="VIP Only">VIP Only</option>
                </select>
                <ChevronDown size={10} className="ce-chev" />
              </div>
              <small>Ticketing / Admission policy</small>
            </div>

            <div className="ce-field ce-span-1-3">
              <CeLabel>QR Code Ticketing</CeLabel>
              <div className="ce-select-wrap">
                <select
                  value={form.qrEnabled ? "enabled" : "disabled"}
                  onChange={(e) => set("qrEnabled", e.target.value === "enabled")}
                  required
                >
                  <option value="enabled">Enabled (Fast-Pass QR)</option>
                  <option value="disabled">Disabled (Manual list only)</option>
                </select>
                <ChevronDown size={10} className="ce-chev" />
              </div>
              <small>Generate gate check-in passes</small>
            </div>

            <div className="ce-field ce-span-half">
              <CeLabel>Target Capacity (Attendees)</CeLabel>
              <input
                type="number"
                min={1}
                max={maxCapacity}
                className="ce-input"
                value={form.capacity}
                onChange={(e) =>
                  set("capacity", Math.min(maxCapacity, Number(e.target.value)))
                }
                required
              />
              <small>Max capacity for this venue: {maxCapacity} seats</small>
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

            <div className="ce-field ce-span-all">
              <div className="ce-label-row">
                <div className="ce-label">
                  <span>Doors Open & Entry Instructions</span>
                </div>
                <small>Printed on ticket pass</small>
              </div>
              <input
                className="ce-input"
                placeholder="e.g., Doors open 30 mins before. Bring UE Student ID."
                value={form.doorsOpenNote}
                onChange={(e) => set("doorsOpenNote", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Section 4 — Coordinator & SAO Memo */}
        <section className="ce-card">
          <CeSectionHeader
            n={4}
            title="Coordinator & SAO Review Brief"
            sub="Official contact details and administrative memo"
            tag="Details"
            tagTone="green"
          />
          <div className="ce-grid">
            <div className="ce-field ce-span-1-3">
              <div className="ce-label">
                <span>Lead Coordinator Name</span>
              </div>
              <input
                className="ce-input"
                placeholder="e.g. Maria Santos"
                value={form.coordinatorName}
                onChange={(e) => set("coordinatorName", e.target.value)}
              />
            </div>

            <div className="ce-field ce-span-1-3">
              <div className="ce-label">
                <span>Coordinator Email</span>
              </div>
              <input
                type="email"
                className="ce-input"
                placeholder="e.g. maria.santos@ue.edu.ph"
                value={form.coordinatorEmail}
                onChange={(e) => set("coordinatorEmail", e.target.value)}
              />
            </div>

            <div className="ce-field ce-span-1-3">
              <div className="ce-label">
                <span>Contact Phone</span>
              </div>
              <input
                className="ce-input"
                placeholder="e.g. 0917-123-4567"
                value={form.coordinatorPhone}
                onChange={(e) => set("coordinatorPhone", e.target.value)}
              />
            </div>

            <div className="ce-field ce-span-all">
              <div className="ce-label-row">
                <div className="ce-label">
                  <span>Pitch & Merits for SAO Memo</span>
                </div>
                <small>Internal review note for Student Affairs</small>
              </div>
              <textarea
                className="ce-input ce-textarea"
                rows={3}
                placeholder="Explain the academic merit, co-curricular alignment, or university impact of this event for Student Affairs evaluation..."
                value={form.memo}
                onChange={(e) => set("memo", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Section 5 — Live Preview Strip */}
        <section className="ce-preview">
          <div className="ce-preview-date">
            <span>{dateMonthStr}</span>
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
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ce-btn ce-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Submitting for Review...
                </>
              ) : (
                <>
                  Submit for SAO Review <Send size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
