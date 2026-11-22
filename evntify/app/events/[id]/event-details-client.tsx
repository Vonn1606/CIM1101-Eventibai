"use client";

import Image from "next/image";
import SignInPrompt from "@/component/dashboard/events/signinprompt";
import { useAuth } from "@/lib/use-auth";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Share2,
  Mail,
  Phone,
  Search,
  Bell,
  User,
  ChevronDown,
  ExternalLink,
  QrCode,
  Home,
  Check,
  X,
  AlertCircle,
  Download,
  CheckCircle2,
} from "lucide-react";
import type { EventDetail } from "@/types/events";
import { registerForEvent } from "@/app/actions/registration";
import type { RegistrationResult } from "@/app/actions/registration";
import { DEPARTMENTS } from "@/lib/department";
import "./event-details.css";

export type InitialRegistration = {
  isRegistered: boolean;
  ticketCode: string;
  status: "registered" | "waitlisted" | null;
};

export type PrefillData = {
  fullName: string;
  studentNumber: string;
  email: string;
  collegeSlug: string;
};

interface EventDetailsClientProps {
  initialEvent: EventDetail;
  initialRegistration: InitialRegistration;
  prefill?: PrefillData | null;
}

function getCountdown(deadline: string) {
  // No deadline set = registration stays open
  if (!deadline || Number.isNaN(new Date(deadline).getTime())) {
    return { days: "--", hours: "--", minutes: "--", closed: false };
  }
  const diff = new Date(deadline).getTime() - Date.now();
  const safe = Math.max(0, diff);
  return {
    days: String(Math.floor(safe / 86_400_000)).padStart(2, "0"),
    hours: String(Math.floor((safe / 3_600_000) % 24)).padStart(2, "0"),
    minutes: String(Math.floor((safe / 60_000) % 60)).padStart(2, "0"),
    closed: diff <= 0,
  };
}
export default function EventDetailsClient({ initialEvent, initialRegistration, prefill }: EventDetailsClientProps) {
  const [event, setEvent] = useState<EventDetail>(initialEvent);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isFastPassModalOpen, setIsFastPassModalOpen] = useState(false);

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: prefill?.fullName ?? "",
    studentNumber: prefill?.studentNumber ?? "",
    email: prefill?.email ?? "",
    college: prefill?.collegeSlug ?? "eng",
  });
  const [fieldErrors, setFieldErrors] = useState<{ studentNumber?: string; college?: string }>({});
  const [ticketCode, setTicketCode] = useState<string>(initialRegistration.ticketCode);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState(initialRegistration.isRegistered);
  const [registrationStatus, setRegistrationStatus] = useState<"registered" | "waitlisted" | null>(
    initialRegistration.status
  );
  const [regError, setRegError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live countdown timer state 
  const [timeLeft, setTimeLeft] = useState(() => getCountdown(initialEvent.registrationDeadline));
  const isClosed = timeLeft.closed;

  useEffect(() => {
    const tick = () => setTimeLeft(getCountdown(event.registrationDeadline));
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [event.registrationDeadline]);

  useEffect(() => {
    if (ticketCode) {
      import("qrcode")
        .then((QRCode) =>
          QRCode.toDataURL(ticketCode, {
            width: 256,
            margin: 1,
            color: {
              dark: "#1a1c1e",
              light: "#ffffff",
            },
          })
        )
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [ticketCode]);
  // Handle Share / Copy Link

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Google Calendar Link
  const handleAddToCalendar = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(
      `${event.summary}\n\nVenue: ${event.venue}\nOrganizer: ${event.org}`
    );
    const location = encodeURIComponent(`${event.venue}, ${event.venueDetails}`);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(gcalUrl, "_blank", "noopener,noreferrer");
  };

  // Submit registration form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegError(null);
    setFieldErrors({});

    // Client-side format validation
    const snRe = /^\d{11}$/;
    const newFieldErrors: typeof fieldErrors = {};
    if (!snRe.test(formData.studentNumber.trim())) {
      newFieldErrors.studentNumber = "Student number must be 11 digits (e.g. 20241234567)";
    }
    if (!formData.college) {
      newFieldErrors.college = "Please select a college";
    }
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setIsSubmitting(false);
      return;
    }

    const targetEventId = event.dbId ?? event.id;
    const result: RegistrationResult = await registerForEvent({
      eventId: targetEventId,
      studentNumber: formData.studentNumber,
      college: formData.college,
    });

    if (result.error) {
      setRegError(result.error);
      setIsSubmitting(false);
      return;
    }

    setTicketCode(result.ticketCode ?? "");
    setRegistrationStatus(result.status ?? "registered");
    setIsRegistered(true);
    setEvent((prev) => ({
      ...prev,
      registeredCount: Math.min(prev.totalCapacity, prev.registeredCount + 1),
      seatsLeft: Math.max(0, prev.seatsLeft - 1),
    }));
    setIsSubmitting(false);
    setIsRegisterModalOpen(false);
    setIsFastPassModalOpen(true);
  };

  const percentageFilled = Math.min(
    100,
    Math.round((event.registeredCount / event.totalCapacity) * 100)
  );

  const { user } = useAuth();
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  const handleRegisterClick = () => {
    if (!user) return setIsAuthPromptOpen(true);
    setIsRegisterModalOpen(true);
  };

  return (
    <div className="event-details-root">
      {/* ---------- Header ---------- */}
      <header className="header" role="banner">
        <div className="header__inner">
          {/* Logo */}
          <Link
            href="/events"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <Image
              src="/eventifytxt-cropped.svg"
              alt="Eventify"
              width={120}
              height={36}
              className="h-9  w-auto object-contain transition transform group-hover:scale-105"
            />
          </Link>

          {/* Search bar */}
          <form role="search" action="/events" method="GET" className="search">
            <div className="search__field">
              <Search className="search__icon" size={14} />
              <input
                type="search"
                name="q"
                placeholder="Search campus events, venues, clubs..."
                className="search__input"
                aria-label="Search campus events"
              />
              <button type="submit" className="search__submit">
                GO
              </button>
            </div>
          </form>

          {/* Header Actions */}
          <div className="header__actions">
            <button type="button" className="nav__btn">
              <span>Departments</span>
              <ChevronDown size={14} className="text-neutral-500" />
            </button>

            <button type="button" className="icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="icon-btn__dot" />
            </button>

            <div className="profile-btn">
              <div className="profile-btn__avatar">
                <User size={16} />
              </div>
              <ChevronDown size={13} className="text-neutral-400" />
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Main ---------- */}
      <main className="main">
        {/* Crumb Bar */}
        <section className="crumbbar" aria-label="Breadcrumb bar">
          <div className="crumbbar__inner">
            <nav className="crumbs" aria-label="Breadcrumb">
              <ol className="crumbs__list">
                <li className="crumbs__item">
                  <Link href="/events" className="crumbs__link">
                    <Home size={13} style={{ marginRight: "2px" }} />
                    Home
                  </Link>
                </li>
                <li className="crumbs__sep" aria-hidden="true">
                  /
                </li>
                <li className="crumbs__item">
                  <Link href="/events" className="crumbs__link">
                    {event.breadcrumbDept || "College of Engineering (CoE)"}
                  </Link>
                </li>
                <li className="crumbs__sep" aria-hidden="true">
                  /
                </li>
                <li className="crumbs__item">
                  <span className="crumbs__current" aria-current="page">
                    {event.title}
                  </span>
                </li>
              </ol>
            </nav>

            <div className="pill">
              <span className="pill__dot" />
              <span>{event.statusBadge || "VERIFIED ACADEMIC COMPETITION"}</span>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="container">
          {/* Hero Banner: Title firmly on the leftmost */}
          <section className="hero">
            <div className="hero__strip" />
            <div className="hero__dots" />
            <div className="hero__body">
              <h1 className="hero__title">{event.title}</h1>
              <div className="hero__oval" />
            </div>
          </section>

          {/* Grid: Left Main + Right Sidebar */}
          <div className="grid">
            {/* Left Column (Main Content) */}
            <div className="col-main">
              {/* Card 1: Organizer Card */}
              <article className="card organizer">
                <div className="organizer__who">
                  <div className="organizer__badge">
                    <span className="organizer__badge-text">{event.orgInitials || "CoE"}</span>
                    <span className="organizer__badge-caption">{event.orgEst || "EST. '64"}</span>
                  </div>
                  <div>
                    <h2 className="organizer__name">{event.org}</h2>
                    <p className="organizer__dept">{event.orgDept}</p>
                  </div>
                </div>
              </article>

              {/* Card 2: Date & Campus Location Card (Aligned on the exact same level) */}
              <article className="card schedule">
                <div className="schedule__col">
                  <div className="schedule__toprow">
                    <span className="eyebrow">DATE & TIME</span>
                    <button
                      type="button"
                      onClick={handleAddToCalendar}
                      className="chip-btn"
                      title="Add to Google Calendar"
                    >
                      <Calendar size={13} className="chip-btn__icon" />
                      <span>Add to Calendar</span>
                    </button>
                  </div>
                  <p className="schedule__value">{event.date}</p>
                  <p className="schedule__note">{event.time}</p>
                </div>

                <div className="schedule__col">
                  <div className="schedule__toprow">
                    <span className="eyebrow">CAMPUS LOCATION</span>
                  </div>
                  <p className="schedule__value">{event.venue}</p>
                  <p className="schedule__note">{event.venueDetails}</p>
                </div>
              </article>

              {/* Card 3: Briefing & Overview Card (Wider & closer to Capacity Status) */}
              <article className="card overview">
                <div className="overview__head">
                  <span className="overview__eyebrow">
                    {event.briefingEyebrow || "BRIEFING • OBJECTIVES"}
                  </span>
                  <h2 className="overview__title">
                    {event.overviewTitle || "Event Overview & Challenge Scope"}
                  </h2>
                </div>

                <div className="overview__copy">
                  {event.description && event.description.length > 0 ? (
                    event.description.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))
                  ) : (
                    <p>{event.summary || "No description provided for this event."}</p>
                  )}
                </div>


              </article>
            </div>

            {/* Right Column (Sidebar) */}
            <aside className="col-side">
              {/* Card 1: Registration Card */}
              <article className="card reg">
                <div className="reg__capacity">
                  <div className="reg__row">
                    <span className="eyebrow">CAPACITY STATUS</span>
                    <span className="reg__tag">
                      ● {event.seatsLeft} slots remaining
                    </span>
                  </div>

                  <div className="reg__row">
                    <div className="reg__count">
                      <span className="reg__big">{event.registeredCount}</span>
                      <span className="reg__of"> /{event.totalCapacity}</span>
                    </div>
                    <span className="reg__pct">{percentageFilled}% Filled</span>
                  </div>

                  <div
                    className="progress"
                    role="progressbar"
                    aria-valuenow={percentageFilled}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="progress__bar"
                      style={{ width: `${percentageFilled}%` }}
                    />
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="countdown">
                  <div className="countdown__head">
                    <Clock size={14} className="countdown__icon" />
                    <span className="eyebrow eyebrow--dark">
                      {isClosed ? "REGISTRATION CLOSED" : "REGISTRATION CLOSES IN"}
                    </span>
                  </div>
                  <div className="countdown__cells">
                    <div className="countdown__cell">
                      <span className="countdown__num">{timeLeft.days}</span>
                      <span className="countdown__label">DAYS</span>
                    </div>
                    <div className="countdown__cell">
                      <span className="countdown__num">{timeLeft.hours}</span>
                      <span className="countdown__label">HOURS</span>
                    </div>
                    <div className="countdown__cell">
                      <span className="countdown__num">{timeLeft.minutes}</span>
                      <span className="countdown__label">MINS</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                {isRegistered ? (
                  <button
                    type="button"
                    onClick={() => setIsFastPassModalOpen(true)}
                    className="cta"
                    style={{ background: "#15803d" }}
                  >
                    <CheckCircle2 size={14} style={{ marginLeft: "4px" }} />
                    <span>{registrationStatus === "waitlisted" ? "WAITLISTED" : "REGISTERED"}</span>
                  </button>
                ) : isClosed ? (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="cta"
                    style={{ background: "#9ca3af", cursor: "not-allowed" }}
                  >
                    <span>REGISTRATION CLOSED</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="cta"
                  >
                    <span>REGISTER</span>
                    <ExternalLink size={14} style={{ marginLeft: "4px" }} />
                  </button>
                )}

                {/* Campus Fast-Pass box (only shown if QR passes are enabled) */}
                {event.qrEnabled !== false && (
                  <div className="rsvp">
                    <div className="rsvp__head">
                      <span className="rsvp__title">Campus Fast-Pass</span>
                      <QrCode size={18} className="rsvp__icon" />
                    </div>
                    <p className="rsvp__body">
                      Already registered via academic department? Claim your quick digital ticket badge for speed-gate entry.
                    </p>
                    <button
                      type="button"
                      onClick={() => (user ? setIsFastPassModalOpen(true) : setIsAuthPromptOpen(true))}
                      className="rsvp__btn"
                    >
                      View Digital Pass Preview
                    </button>
                  </div>
                )}
              </article>

              {/* Card 2: Need Assistance / Coordinator Card */}
              <article className="card contact">
                <span className="eyebrow">NEED ASSISTANCE?</span>
                <h3 className="contact__title">Event Coordinators</h3>

                <div className="contact__person">
                  <div className="contact__avatar">{event.coordinator.initials || "MR"}</div>
                  <div>
                    <p className="contact__name">{event.coordinator.name}</p>
                    <p className="contact__role">{event.coordinator.role}</p>
                  </div>
                </div>

                <div className="contact__links">
                  <a href={`mailto:${event.coordinator.email}`}>
                    <Mail size={13} />
                    <span>{event.coordinator.email}</span>
                  </a>
                  <a href={`tel:${event.coordinator.phone}`}>
                    <Phone size={13} />
                    <span>{event.coordinator.phone}</span>
                  </a>
                </div>
              </article>

              {/* Share & Meta Row */}
              <div className="sharebar">
                <span className="sharebar__text">Event ID: #{event.code}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="sharebar__btn"
                  title="Share event link"
                >
                  {isCopied ? <Check size={13} /> : <Share2 size={13} />}
                  <span>{isCopied ? "Link Copied!" : "Share"}</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main >

      {/* ---------- Registration Modal ---------- */}
      {
        isRegisterModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c0c28]">
                  Official Academic Registration
                </span>
                <h2 className="text-xl font-bold text-neutral-900 mt-1">
                  {event.title}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Register to secure your lab seat and generate your Campus Fast-Pass.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Rivera"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#6c0c28]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Student ID Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="20241234567"
                      inputMode="numeric"
                      pattern="\d{11}"
                      value={formData.studentNumber}
                      readOnly={!!prefill?.studentNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, studentNumber: e.target.value.trim() });
                        if (fieldErrors.studentNumber) setFieldErrors((prev) => ({ ...prev, studentNumber: undefined }));
                      }}
                      className={`w-full px-3.5 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#6c0c28]/30 ${fieldErrors.studentNumber ? "border-red-400" : "border-neutral-200"} ${prefill?.studentNumber ? "bg-neutral-50 cursor-not-allowed" : ""}`}
                    />
                    {fieldErrors.studentNumber && (
                      <p className="text-xs text-red-600 mt-0.5">{fieldErrors.studentNumber}</p>
                    )}
                    <p className="text-[10px] text-neutral-400 mt-0.5">Format: 11 digits (e.g. 20241234567)</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Campus Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@campus.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#6c0c28]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Department / College
                  </label>
                  <select
                    value={formData.college}
                    onChange={(e) => {
                      setFormData({ ...formData, college: e.target.value });
                      if (fieldErrors.college) setFieldErrors((prev) => ({ ...prev, college: undefined }));
                    }}
                    disabled={!!prefill?.collegeSlug}
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6c0c28]/30 ${fieldErrors.college ? "border-red-400" : "border-neutral-200"} ${prefill?.collegeSlug ? "cursor-not-allowed bg-neutral-50" : ""}`}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  {fieldErrors.college && (
                    <p className="text-xs text-red-600 mt-0.5">{fieldErrors.college}</p>
                  )}
                  {prefill?.collegeSlug && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">From your profile · <a href="/profile" className="underline">Edit in profile</a></p>
                  )}
                </div>

                <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-100 flex items-start gap-2.5 text-xs text-neutral-600">
                  <AlertCircle size={16} className="text-[#6c0c28] flex-shrink-0 mt-0.5" />
                  <span>
                    By registering, you confirm attendance for <strong>{event.venue}</strong>. Your QR ticket
                    is non-transferable and verified at entrance doors.
                  </span>
                </div>

                {regError && (
                  <p className="text-xs text-red-600 font-medium">{regError}</p>
                )}

                <div className="mt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#6c0c28] hover:bg-[#8b263e] rounded-lg shadow-sm transition flex items-center gap-2"
                  >
                    {isSubmitting ? "Generating Fast-Pass..." : "Confirm & Claim Fast-Pass"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      <SignInPrompt
        open={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        nextPath={`/events/${event.id}`}
      />

      {/* ---------- Digital Fast-Pass Preview Modal ---------- */}
      {
        isFastPassModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-md rounded-2xl bg-white overflow-hidden shadow-2xl border border-neutral-100">
              {/* Header banner */}
              <div className="bg-[#6c0c28] p-5 text-white text-center relative">
                <button
                  type="button"
                  onClick={() => setIsFastPassModalOpen(false)}
                  className="absolute right-3.5 top-3.5 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase mb-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Campus Fast-Pass
                </span>
                <h2 className="text-lg font-extrabold leading-snug">
                  {event.title}
                </h2>
                <p className="text-xs text-white/80 mt-1">
                  {event.date} · {event.time}
                </p>
              </div>

              {/* QR Code Pass Body */}
              <div className="p-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-xl bg-white border-2 border-dashed border-neutral-200 shadow-sm mb-4">
                  {qrCodeDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrCodeDataUrl}
                      alt={`Ticket QR Code for ${ticketCode}`}
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center bg-neutral-100 rounded text-xs text-neutral-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div className="w-full rounded-lg bg-neutral-50 p-3 mb-4 text-left border border-neutral-100 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">Badge Pass ID:</span>
                    <span className="font-mono font-bold text-[#6c0c28] tracking-wider text-sm">
                      {ticketCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">Venue Gate:</span>
                    <span className="font-semibold text-neutral-800">{event.venue}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${registrationStatus === "waitlisted" ? "text-amber-700 bg-amber-100" : "text-emerald-700 bg-emerald-100"}`}>
                      {registrationStatus === "waitlisted" ? "WAITLISTED" : "VERIFIED SPEED-GATE PASS"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (!qrCodeDataUrl) return;
                      const a = document.createElement("a");
                      a.href = qrCodeDataUrl;
                      a.download = `fast-pass-${ticketCode}.png`;
                      a.click();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-[#6c0c28] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#8b263e] transition"
                  >
                    <Download size={14} />
                    Download Badge
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFastPassModalOpen(false)}
                    className="py-2.5 px-4 rounded-lg bg-neutral-100 text-neutral-700 font-bold text-xs hover:bg-neutral-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* ---------- Footer ---------- */}
      <footer className="footer" role="contentinfo">
        <div className="footer__inner">
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <p className="footer__brand">eventify.</p>
            <p className="footer__tag">
              © 2025 Eventify Campus Inc. All rights reserved. Connecting university life & student culture.
            </p>
          </div>
          <nav className="footer__links" aria-label="Footer Navigation">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="/events">Event Directory</Link>
            <Link href="#">Academic Colleges</Link>
          </nav>
        </div>
      </footer>
    </div >
  );
}
