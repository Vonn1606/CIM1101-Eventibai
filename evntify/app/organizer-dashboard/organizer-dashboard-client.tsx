"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { submitEvent, toggleCheckIn } from "@/app/actions/events";
import { sendBroadcast, getBroadcastLogs } from "@/app/actions/broadcasts";
import type { BroadcastLogItem } from "@/app/actions/broadcasts";
import type { OrgEvent, OrgRosterStudent } from "@/lib/db/organizer";
import ProfileDropdown from "@/component/auth/profile-dropdown";
import { useAuth } from "@/lib/use-auth";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  LayoutGrid,
  MapPin,
  Megaphone,
  Menu,
  Plus,
  QrCode,
  Radio,
  Search,
  Settings,
  Sparkles,
  Terminal,
  UserCheck,
  Users,
  X,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  MessageSquare,
  Bot,
  Zap,
} from "lucide-react";

/* ==========================================================================
   Data Types & Initial State (matching Figma Mockup)
   ========================================================================== */

// Types are imported from @/lib/db/organizer
type EventStatus = OrgEvent["status"];

// Local alias for the imported type
type EventItem = OrgEvent;



export type RosterStudent = OrgRosterStudent;

// INITIAL_EVENTS replaced by props (see page.tsx)

// INITIAL_ROSTER replaced by props (see page.tsx)

const QUICK_PRESETS = [
  {
    id: "doors-open",
    label: "Doors open 15m",
    text: "Doors open in 15 mins! Have your student QR codes ready for fast gate tap at the venue entrance.",
  },
  {
    id: "swag-booth",
    label: "Swag at Booth",
    text: "Event merchandise and kits are now available at the main foyer. Claim with your event pass!",
  },
  {
    id: "room-change",
    label: "Room Change",
    text: "Notice: The workshop breakout session has been relocated. Please proceed calmly.",
  },
];

/* ==========================================================================
   Main Component
   ========================================================================== */

interface OrganizerDashboardClientProps {
  initialEvents?: OrgEvent[];
  initialRoster?: OrgRosterStudent[];
  organizerName?: string;
  orgName?: string;
}

export default function OrganizerDashboardClient({
  initialEvents = [],
  initialRoster = [],
  organizerName = "Organizer",
  orgName = "My Organisation",
}: OrganizerDashboardClientProps) {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [registryFilter, setRegistryFilter] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // App Data
  const [events, setEvents] = useState<OrgEvent[]>(initialEvents);
  const [roster, setRoster] = useState<OrgRosterStudent[]>(initialRoster);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [activeChannels, setActiveChannels] = useState<{ [key: string]: boolean }>({
    push: true,
    sms: true,
    discord: true,
  });
  const [selectedCohort, setSelectedCohort] = useState("all");
  const [selectedRosterEvent, setSelectedRosterEvent] = useState("all");
  const [rosterSearch, setRosterSearch] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");

  // Form State for "Submit Event for SAO Approval"
  const [formTitle, setFormTitle] = useState("");
  const [formHostOrg, setFormHostOrg] = useState(orgName);
  const [formVenue, setFormVenue] = useState("");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formCapLimit, setFormCapLimit] = useState("200");
  const [formTier, setFormTier] = useState("Tiled RSVP");
  const [formMemo, setFormMemo] = useState("");

  // Notification / Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nfcSimulating, setNfcSimulating] = useState(false);

  // Modal State
  const [quickCheckinOpen, setQuickCheckinOpen] = useState(false);
  // const [qrModalEvent, setQrModalEvent] = useState<EventItem | null>(null);
  const [editModalEvent, setEditModalEvent] = useState<EventItem | null>(null);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastLogItem[]>([]);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Profile dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user } = useAuth();

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handler: Toggle Gate Check-in for Student
  const handleToggleCheckin = async (studentId: string) => {
    const target = roster.find((s) => s.studentId === studentId);
    if (!target) return;
    const nextStatus = !target.checkedIn;

    // Optimistic update
    setRoster((prev) =>
      prev.map((student) => {
        if (student.studentId === studentId) {
          const timeStr = nextStatus
            ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : undefined;
          return {
            ...student,
            checkedIn: nextStatus,
            checkedInTime: timeStr,
          };
        }
        return student;
      })
    );

    const res = await toggleCheckIn(target.id, target.checkedIn);
    if (res.error) {
      showToast(`Check-in update failed: ${res.error}`);
      // Revert optimistic update
      setRoster((prev) =>
        prev.map((s) => (s.studentId === studentId ? target : s))
      );
    }
  };

  // Handler: Simulate NFC Tap / Scan
  const handleSimulateNfcTap = () => {
    setNfcSimulating(true);
    // Find first pending student or simulate a new checkin
    setTimeout(() => {
      setNfcSimulating(false);
      const pendingStudent = roster.find((s) => !s.checkedIn);
      if (pendingStudent) {
        handleToggleCheckin(pendingStudent.studentId);
        showToast(`⚡ NFC Beacon Synced: ${pendingStudent.name} checked in!`);
      } else {
        showToast("⚡ NFC Beacon Synced: Card validated successfully (ID 2022-84928-MN)");
      }
    }, 600);
  };

  // Handler: Submit Event for SAO Approval
  const handleSubmitSAO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Please enter an event title.");
      return;
    }

    const parsedDate = new Date(formDate);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[parsedDate.getMonth()] || "NOV";
    const day = String(parsedDate.getDate() || 15).padStart(2, "0");

    const res = await submitEvent({
      title: formTitle.trim(),
      venue: formVenue,
      date: formDate,
      capacity: Number(formCapLimit) || 200,
      tier: formTier,
      memo: formMemo,
    });

    if (res.error) {
      showToast(`Submission failed: ${res.error}`);
      return;
    }

    const newEvent: EventItem = {
      id: res.eventId ?? String(Date.now()),
      month,
      day,
      title: formTitle.trim(),
      venue: formVenue,
      time: "1:00 PM – 5:00 PM PST",
      status: "pending",
      badgeLabel: "Pending SAO Clearance",
      registered: 0,
      cap: Number(formCapLimit) || 200,
      capType: "RSVPs",
      org: formHostOrg,
      tier: formTier,
      waitlistCount: 0,
    };

    setEvents((prev) => [newEvent, ...prev]);
    showToast(`✓ "${formTitle}" submitted to SAO! Clearance review queued.`);
    setFormTitle("");
    setFormMemo("");
  };

  // Handler: Open Delivery Logs Modal
  const handleOpenLogs = async () => {
    setLogsModalOpen(true);
    const logs = await getBroadcastLogs();
    setBroadcastLogs(logs);
  };

  // Handler: Instant Broadcast Send
  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      showToast("Please enter a message to broadcast.");
      return;
    }

    const channels = (
      Object.entries(activeChannels)
        .filter(([, active]) => active)
        .map(([name]) => name) as ("push" | "sms" | "discord")[]
    );

    setIsSendingBroadcast(true);
    const targetEvent = selectedCohort === "all" ? undefined : events.find((ev) => ev.title === selectedCohort || ev.id === selectedCohort);
    const res = await sendBroadcast({
      eventId: targetEvent?.id,
      message: broadcastMessage,
      channels: channels.length > 0 ? channels : ["push"],
    });
    setIsSendingBroadcast(false);

    if (res.error) {
      showToast(`Broadcast failed: ${res.error}`);
    } else {
      showToast(`🚀 Broadcast sent! (${res.recipientCount} notified)`);
      setBroadcastMessage("");
    }
  };

  // Filtered Registry Events
  const filteredEvents = useMemo(() => {
    let list = events;
    if (registryFilter === "active") {
      list = list.filter((e) => e.status === "live");
    } else if (registryFilter === "sao") {
      list = list.filter((e) => e.status === "pending");
    } else if (registryFilter === "archived") {
      list = list.filter((e) => e.status === "archived");
    }

    if (headerSearch.trim()) {
      const q = headerSearch.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.org && e.org.toLowerCase().includes(q))
      );
    }
    return list;
  }, [events, registryFilter, headerSearch]);

  // Filtered Roster Students
  const filteredRoster = useMemo(() => {
    let list = roster;
    if (selectedRosterEvent && selectedRosterEvent !== "all") {
      list = list.filter(
        (s) => s.eventTrack.toLowerCase() === selectedRosterEvent.toLowerCase()
      );
    }
    const q = rosterSearch.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.eventTrack.toLowerCase().includes(q) ||
        s.yearProgram.toLowerCase().includes(q)
    );
  }, [roster, selectedRosterEvent, rosterSearch]);

  const checkedInCount = roster.filter((s) => s.checkedIn).length;
  const activeEventsCount = useMemo(
    () => events.filter((e) => e.status === "live" || e.status === "soldout").length,
    [events]
  );
  const pendingCount = useMemo(
    () => events.filter((e) => e.status === "pending").length,
    [events]
  );
  const totalRegistered = useMemo(
    () => events.reduce((sum, e) => sum + (e.registered || 0), 0),
    [events]
  );
  const totalCapacity = useMemo(
    () => events.reduce((sum, e) => sum + (e.cap || 0), 0),
    [events]
  );
  const bookedVenues = useMemo(
    () => Array.from(new Set(events.filter((e) => e.venue && e.venue !== "TBD").map((e) => e.venue))),
    [events]
  );
  const hallUtilization = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;
  const organizerInitials = organizerName
    ? organizerName
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "OR";

  return (
    <div
      className="min-h-screen bg-[#FAFAF8] text-[#1E1B19] antialiased selection:bg-[#FCECEF] selection:text-[#651C32]"
      style={{
        fontFamily: "var(--font-dm-sans), var(--font-jakarta), -apple-system, sans-serif",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#1E1B19] px-5 py-3.5 text-xs font-semibold text-white shadow-2xl transition-all">
          <CheckCircle2 size={16} className="text-[#3DD68C] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#9A8B88] hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ====================================================================
          LEFT SIDEBAR (Matches Figma exact look: logo, org card, nav items)
          ==================================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-[#ECE5DF] bg-white px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo & Close on mobile */}
          <div className="flex items-center justify-between">
            <Link
              href="/organizer-dashboard"
              className="flex items-center gap-2 group transition focus:outline-none"
            >
              <img
                src="/eventifytxt-cropped.svg"
                alt="eventify."
                className="h-8.5 w-auto object-contain transition transform group-hover:scale-105"
                style={{ height: "34px", width: "auto" }}
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-[#7E6E6A] hover:bg-[#FAF5F2] lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Org Profile Pill / Badge (Figma look) */}
          <div className="flex items-center justify-between rounded-2xl border border-[#EFE4DE] bg-[#F8EFEA] p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#651C32] font-mono text-[11px] font-bold text-white shadow-2xs">
                &lt;/&gt;
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#1E1B19]">
                  {orgName}
                  <span className="size-1 rounded-full bg-[#1E1B19]" />
                </span>
                <span className="text-[11px] font-medium text-[#7E6E6A]">
                  Information Technology
                </span>
              </div>
            </div>
            <ChevronDown size={14} className="text-[#8A7B78]" />
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveTab("overview");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${activeTab === "overview"
                  ? "bg-[#ECE5E0] text-[#1E1B19] shadow-2xs"
                  : "text-[#6B5B58] hover:bg-[#FAF5F2] hover:text-[#1E1B19]"
                }`}
            >
              <LayoutGrid size={16} className={activeTab === "overview" ? "text-[#651C32]" : "text-[#7E6E6A]"} />
              <span>Overview</span>
            </button>

            <a
              href="#events-registry"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#6B5B58] transition hover:bg-[#FAF5F2] hover:text-[#1E1B19]"
            >
              <CalendarDays size={16} className="text-[#7E6E6A]" />
              <span>Events &amp; Manage</span>
            </a>

            <a
              href="#participant-checkin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#6B5B58] transition hover:bg-[#FAF5F2] hover:text-[#1E1B19]"
            >
              <UserCheck size={16} className="text-[#7E6E6A]" />
              <span>Attendees &amp; Check-In</span>
            </a>

            <a
              href="#broadcast-composer"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#6B5B58] transition hover:bg-[#FAF5F2] hover:text-[#1E1B19]"
            >
              <Megaphone size={16} className="text-[#7E6E6A]" />
              <span>Broadcast Announcement</span>
            </a>

            <button
              onClick={() => {
                showToast("⚙️ Settings configuration synced with Student Council portal.");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#6B5B58] transition hover:bg-[#FAF5F2] hover:text-[#1E1B19]"
            >
              <Settings size={16} className="text-[#7E6E6A]" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Utility Navigation */}
        <div className="flex flex-col gap-2 border-t border-[#ECE5DF] pt-4">
          <Link
            href="/user-dashboard"
            className="flex items-center justify-between rounded-xl border border-[#E8DFD8] bg-[#FAF5F2] px-3.5 py-2.5 text-xs font-semibold text-[#651C32] transition hover:bg-[#F2ECE8]"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={13} />
              Switch to Student View
            </span>
            <span className="rounded bg-[#FCECEF] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8C233C]">
              Portal
            </span>
          </Link>

          <Link
            href="/events"
            className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-[#7E6E6A] transition hover:text-[#1E1B19]"
          >
            <span>Public Events Catalog</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ====================================================================
          MAIN CONTENT WRAPPER
          ==================================================================== */}
      <div className="lg:pl-64">
        {/* Top Header Bar (Breadcrumb, Search, Alerts, Profile) */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#ECE5DF] bg-[#FAFAF8]/90 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#7E6E6A] hover:bg-[#FAF5F2] lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <Sparkles size={15} className="text-[#651C32]" />
            <span className="hidden text-xs font-semibold text-[#1E1B19] sm:inline">
              Student Council Portal
            </span>
            <span className="hidden text-[#B5A8A4] sm:inline">/</span>
            <span className="rounded-full bg-[#FCECEF] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8C233C]">
              ORGANIZER MODE
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-2.5 text-[#8A7B78]" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search events, rosters, tags..."
                className="h-8 w-44 rounded-xl border border-[#ECE2DC] bg-white pl-8 pr-3 text-xs text-[#1E1B19] placeholder:text-[#9A8B88] focus:border-[#651C32] focus:outline-none sm:w-64"
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() =>
                showToast(
                  `🔔 ${pendingCount} event(s) in review, ${activeEventsCount} active.`
                )
              }
              className="relative flex size-8 items-center justify-center rounded-xl border border-[#ECE2DC] bg-white text-[#554243] transition hover:bg-[#FAF5F2]"
              aria-label="Notifications"
            >
              <Bell size={14} />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#E13654] ring-2 ring-white" />
            </button>

            {/* User Profile Avatar + Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((o) => !o)}
                className="flex size-8 items-center justify-center rounded-full bg-[#651C32] text-xs font-bold text-white shadow-2xs hover:opacity-90"
                title="Account menu"
                aria-label="Account menu"
                aria-expanded={profileDropdownOpen}
              >
                {organizerInitials}
              </button>
              {profileDropdownOpen && (
                <ProfileDropdown
                  name={
                    user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    user?.email?.split("@")[0] ||
                    organizerName
                  }
                  role="Organizer"
                  onClose={() => setProfileDropdownOpen(false)}
                />
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 space-y-8">
          {/* ================================================================
              PAGE HEADER: "{organizerName ? `Hey ${organizerName} !` : "Hey User !"}" Greeting & Action Buttons
              ================================================================ */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="text-[32px] sm:text-[38px] font-semibold tracking-tight text-[#1E1B19] leading-tight"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  {organizerName ? `Hey ${organizerName} !` : "Hey User !"}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FAD6DC] bg-[#FDF0F2] px-3 py-1 text-xs font-semibold text-[#8C233C]">
                  <span className="size-1.5 rounded-full bg-[#107E59] animate-pulse" />
                  Live Campus Hub
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#7A6B68]">
                <span className="font-semibold text-[#1E1B19]">{orgName}</span>
                <span>—</span>
                <span className="rounded-full bg-[#FCECEF] px-2 py-0.5 text-[11px] font-semibold text-[#8C233C]">
                  Org Mode Active
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setQuickCheckinOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-[#E4D9D2] bg-[#FAF5F2] px-4 py-2.5 text-xs font-semibold text-[#2C181C] shadow-2xs transition hover:bg-[#F2ECE8] active:scale-95 cursor-pointer"
              >
                Quick Check-in Mode
              </button>
              <Link
                href="/organizer-dashboard/create-event"
                className="flex items-center gap-1.5 rounded-xl bg-[#651C32] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#521325] active:scale-95 cursor-pointer"
              >
                <Plus size={14} />
                Create Event
              </Link>
            </div>
          </section>

          {/* ================================================================
              ROW OF 4 KPI / METRIC CARDS (Exact match to Figma)
              ================================================================ */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: TOTAL CHECK-INS */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#ECE5DF] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[160px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B78]">
                  TOTAL CHECK-INS
                </span>
                <span className="rounded-full bg-[#E5F7F0] px-2 py-0.5 text-[10px] font-bold text-[#0E6245]">
                  {checkedInCount} verified
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span
                  className="text-[40px] font-semibold leading-none text-[#1E1B19] tracking-tight"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  {checkedInCount.toLocaleString()}
                </span>
                <div className="text-[10px] leading-tight text-[#8A7B78] flex flex-col font-medium">
                  <span>of {roster.length}</span>
                  <span>roster</span>
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[11px] font-medium text-[#7A6B68]">
                  <span>Campus Hall Utilization</span>
                  <span className="font-bold text-[#1E1B19]">{hallUtilization > 0 ? `${hallUtilization}%` : "—"}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#F2ECE8] overflow-hidden">
                  <div className="h-full rounded-full bg-[#651C32]" style={{ width: `${hallUtilization}%` }} />
                </div>
              </div>
            </div>

            {/* Card 2: LIVE ACTIVE EVENTS */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#ECE5DF] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[160px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B78]">
                  LIVE ACTIVE EVENTS
                </span>
                <span className="rounded-full bg-[#E5F7F0] px-2 py-0.5 text-[10px] font-bold text-[#0E6245]">
                  {activeEventsCount} operating now
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span
                  className="text-[40px] font-semibold leading-none text-[#1E1B19] tracking-tight"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  {String(bookedVenues.length).padStart(2, "0")}
                </span>
                <span className="text-xs font-medium text-[#7A6B68] leading-tight">
                  venues booked
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8C233C]">
                <span className="size-2 rounded-full bg-[#8C233C]" />
                <span>{bookedVenues[0] ? `${bookedVenues[0]} is active` : "No active venues currently"}</span>
              </div>
            </div>

            {/* Card 3: SAO APPROVAL QUEUE */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#ECE5DF] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[160px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B78]">
                  SAO APPROVAL QUEUE
                </span>
                <span className="rounded-full bg-[#FDF0E8] px-2 py-0.5 text-[10px] font-bold text-[#C4384F]">
                  {pendingCount > 0 ? "Pending" : "Cleared"}
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span
                  className="text-[40px] font-semibold leading-none text-[#1E1B19] tracking-tight"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  {String(pendingCount).padStart(2, "0")}
                </span>
                <span className="text-xs font-medium text-[#7A6B68] leading-tight">
                  in review
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#7A6B68] font-medium">
                <Clock size={12} className="text-[#8A7B78]" />
                <span>{pendingCount > 0 ? "Awaiting SAO clearance" : "All proposals processed"}</span>
              </div>
            </div>

            {/* Card 4: CAMPUS BROADCAST REACH */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#ECE5DF] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[160px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B78]">
                  CAMPUS BROADCAST REACH
                </span>
                <Radio size={14} className="text-[#8A7B78]" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span
                  className="text-[40px] font-semibold leading-none text-[#1E1B19] tracking-tight"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  {totalRegistered > 0 ? totalRegistered.toLocaleString() : "0"}
                </span>
                <span className="text-xs font-medium text-[#7A6B68] leading-tight">
                  students
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-[#0E6245]">
                  <span className="size-1.5 rounded-full bg-[#0E6245]" />
                  Push / SMS
                </span>
                <button
                  type="button"
                  onClick={handleOpenLogs}
                  className="font-semibold text-[#8A7B78] hover:text-[#651C32] transition cursor-pointer"
                >
                  Logs &rarr;
                </button>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION: "UEvents' Registry" (3 Event Cards with exact design)
              ================================================================ */}
          <section id="events-registry" className="space-y-4 scroll-mt-24">
            {/* Header & Filter Tabs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className="text-[26px] font-bold tracking-tight text-[#651C32]"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  UEvents’ Registry
                </h2>
                <p className="text-xs text-[#7A6B68]">
                  Manage and monitor college gatherings, capacity limits, and real-time door lists.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 rounded-full bg-[#F5EFEB] p-1 self-start sm:self-auto">
                <button
                  onClick={() => setRegistryFilter("all")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${registryFilter === "all"
                      ? "bg-[#651C32] text-white shadow-2xs"
                      : "text-[#6A5A57] hover:text-[#1E1B19]"
                    }`}
                >
                  All ({events.length})
                </button>
                <button
                  onClick={() => setRegistryFilter("active")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${registryFilter === "active"
                      ? "bg-[#651C32] text-white shadow-2xs"
                      : "text-[#6A5A57] hover:text-[#1E1B19]"
                    }`}
                >
                  Active ({events.filter((e) => e.status === "live" || e.status === "soldout").length})
                </button>
                <button
                  onClick={() => setRegistryFilter("sao")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${registryFilter === "sao"
                      ? "bg-[#651C32] text-white shadow-2xs"
                      : "text-[#6A5A57] hover:text-[#1E1B19]"
                    }`}
                >
                  SAO Pending ({events.filter((e) => e.status === "pending").length})
                </button>
                <button
                  onClick={() => setRegistryFilter("archived")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${registryFilter === "archived"
                      ? "bg-[#651C32] text-white shadow-2xs"
                      : "text-[#6A5A57] hover:text-[#1E1B19]"
                    }`}
                >
                  Archived ({events.filter((e) => e.status === "archived").length})
                </button>
              </div>
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((evt) => {
                const percent = Math.min(100, Math.round((evt.registered / evt.cap) * 100));

                return (
                  <div
                    key={evt.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#ECE5DF] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition hover:shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Date Box + Status Badge */}
                      <div className="flex items-start justify-between">
                        <div className="flex w-11 flex-col items-center rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-2 py-1 text-center shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C233C]">
                            {evt.month}
                          </span>
                          <span
                            className="text-lg font-bold leading-tight text-[#1E1B19]"
                            style={{
                              fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                            }}
                          >
                            {evt.day}
                          </span>
                        </div>

                        {/* Status Badge */}
                        {evt.status === "live" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F7F0] px-2.5 py-1 text-[10px] font-bold text-[#0E6245]">
                            <span className="size-1.5 rounded-full bg-[#0E6245]" />
                            {evt.badgeLabel}
                          </span>
                        )}
                        {evt.status === "soldout" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0E8] px-2.5 py-1 text-[10px] font-bold text-[#B85414]">
                            <span className="size-1.5 rounded-full bg-[#B85414]" />
                            {evt.badgeLabel}
                          </span>
                        )}
                        {evt.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCECEF] px-2.5 py-1 text-[10px] font-bold text-[#C4384F]">
                            <span className="size-1.5 rounded-full bg-[#C4384F]" />
                            {evt.badgeLabel}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="text-[17px] font-bold leading-snug text-[#1E1B19]"
                        style={{
                          fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                        }}
                      >
                        {evt.title}
                      </h3>

                      {/* Location & Time */}
                      <div className="space-y-1 text-xs text-[#7A6B68]">
                        <p className="flex items-center gap-1.5">
                          <MapPin size={13} className="shrink-0 text-[#8A7B78]" />
                          <span>{evt.venue}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock size={13} className="shrink-0 text-[#8A7B78]" />
                          <span>{evt.time}</span>
                        </p>
                      </div>

                      {/* Capacity Tracker */}
                      <div className="pt-2">
                        <div className="mb-1 flex justify-between text-[11px] font-medium text-[#7A6B68]">
                          <span>
                            {evt.status === "pending" ? "Early RSVPs" : "Capacity Tracker"}
                          </span>
                          <span className="font-bold text-[#1E1B19]">
                            {evt.registered} / {evt.cap} {evt.capType} ({percent}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#F2ECE8] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#651C32] transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons (Card Actions) */}
                    <div className="mt-5 flex items-center justify-between gap-1.5 border-t border-[#ECE5DF] pt-4">
                      {/* Button 1: Edit */}
                      <button
                        onClick={() => {
                          setEditModalEvent(evt);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-[#E8DFD8] bg-[#FAF5F2] px-2.5 py-1.5 text-xs font-semibold text-[#2C181C] transition hover:bg-[#F2ECE8] cursor-pointer"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>

                      {/* Button 2: Roster or Waitlist or Print */}
                      {evt.status === "live" && (
                        <a
                          href="#participant-checkin"
                          className="flex items-center gap-1 rounded-lg border border-[#E8DFD8] bg-[#FAF5F2] px-2.5 py-1.5 text-xs font-semibold text-[#2C181C] transition hover:bg-[#F2ECE8]"
                        >
                          <Users size={11} />
                          <span>Roster ({evt.registered || evt.waitlistCount || 0})</span>
                        </a>
                      )}
                      {evt.status === "soldout" && (
                        <button
                          onClick={() => showToast(`📋 Waitlist for ${evt.title}: ${evt.waitlistCount || 14} students queued.`)}
                          className="flex items-center gap-1 rounded-lg border border-[#E8DFD8] bg-[#FAF5F2] px-2.5 py-1.5 text-xs font-semibold text-[#2C181C] transition hover:bg-[#F2ECE8] cursor-pointer"
                        >
                          <Users size={11} />
                          <span>Waitlist ({evt.waitlistCount || 14})</span>
                        </button>
                      )}
                      {evt.status === "pending" && (
                        <button
                          onClick={() => showToast("🖨️ PDF endorsement memo downloaded for Student Affairs clearance.")}
                          className="flex items-center gap-1 rounded-lg border border-[#E8DFD8] bg-[#FAF5F2] px-2 py-1.5 text-xs font-semibold text-[#2C181C] transition hover:bg-[#F2ECE8] cursor-pointer"
                        >
                          <FileText size={11} />
                          <span>Print/Resend PDF</span>
                        </button>
                      )}

                      {/* Button 3: Broadcast or Inspect */}
                      {evt.status === "pending" ? (
                        <button
                          onClick={() => showToast("🔎 SAO Routing Inspector: Status 'Under Dean Review' at Administration Hall Rm 302.")}
                          className="flex items-center gap-1 rounded-lg border border-[#E8DFD8] bg-[#FAF5F2] px-2.5 py-1.5 text-xs font-semibold text-[#2C181C] transition hover:bg-[#F2ECE8] cursor-pointer"
                        >
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setBroadcastMessage(
                              `Update for "${evt.title}": Doors open on schedule at ${evt.venue}. Please present your Eventify QR pass!`
                            );
                            const el = document.getElementById("broadcast-composer");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="flex items-center gap-1 rounded-lg bg-[#651C32] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#521325] active:scale-95 cursor-pointer"
                        >
                          <Megaphone size={11} />
                          <span>Broadcast</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================================================================
              TWO-COLUMN SECTION:
              Left: Submit Event for SAO Approval (7 cols)
              Right: Instant Broadcast Composer (5 cols)
              ================================================================ */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* LEFT: Fast-Track Filing Form */}
            <div
              id="event-submission-form"
              className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#ECE5DF] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5 scroll-mt-24"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C4384F]">
                    <span>FAST-TRACK FILING</span>
                  </div>
                  <h3
                    className="text-[24px] font-bold text-[#651C32] leading-tight"
                    style={{
                      fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                    }}
                  >
                    Submit Event for SAO Approval
                  </h3>
                  <p className="text-xs text-[#7A6B68]">
                    Direct routing to Student Affairs Office. Approvals sync automatically.
                  </p>
                </div>
                <div className="rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-2 text-[#651C32]">
                  <ExternalLink size={16} />
                </div>
              </div>

              <form onSubmit={handleSubmitSAO} className="space-y-4">
                {/* Event Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1B19]">
                    Event Title <span className="text-[#C4384F]">*</span>
                  </label>
                  <input
                    id="event-title-input"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. AWS Student Community Cloud Day"
                    className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 text-xs text-[#1E1B19] placeholder:text-[#9A8B88] focus:bg-white focus:border-[#651C32] focus:outline-none transition"
                  />
                </div>

                {/* Host Org & Campus Venue */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E1B19]">
                      Host Organization
                    </label>
                    <input
                      type="text"
                      value={formHostOrg}
                      onChange={(e) => setFormHostOrg(e.target.value)}
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 text-xs text-[#1E1B19] font-medium focus:bg-white focus:border-[#651C32] focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E1B19]">
                      Campus Venue <span className="text-[#C4384F]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formVenue}
                        onChange={(e) => setFormVenue(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 pr-8 text-xs font-medium text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none transition cursor-pointer"
                      >
                        <option value="Tan Yan Kee Conf Hall • 11th Flr">Tan Yan Kee Conf Hall • 11th Flr</option>
                        <option value="Computer Laboratory 2nd Floor">Computer Laboratory 2nd Floor</option>
                        <option value="UE Theater Main Stage">UE Theater Main Stage</option>
                        <option value="Tan Yan Kee Hall A • 11th Flr">Tan Yan Kee Hall A • 11th Flr</option>
                        <option value="Engineering AVR 3rd Flr">Engineering AVR 3rd Flr</option>
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-2.5 text-[#8A7B78]" />
                    </div>
                  </div>
                </div>

                {/* Date, Cap Limit, Tier */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E1B19]">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3 py-2 text-xs font-medium text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E1B19]">Cap Limit</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={formCapLimit}
                        onChange={(e) => setFormCapLimit(e.target.value)}
                        className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3 py-2 text-xs font-medium text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none transition"
                      />
                      <span className="pointer-events-none absolute right-3 top-2 text-[10px] font-bold text-[#8A7B78] uppercase">
                        pax
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E1B19]">Tier</label>
                    <div className="relative">
                      <select
                        value={formTier}
                        onChange={(e) => setFormTier(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3 py-2 pr-7 text-xs font-medium text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none transition cursor-pointer"
                      >
                        <option value="Tiled RSVP">Tiled RSVP</option>
                        <option value="Free RSVP">Free RSVP</option>
                        <option value="Ticketed">Ticketed</option>
                        <option value="VIP Only">VIP Only</option>
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-[#8A7B78]" />
                    </div>
                  </div>
                </div>

                {/* Short Pitch / Memo Summary */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1B19]">
                    Short Pitch / Memo Summary
                  </label>
                  <textarea
                    rows={3}
                    value={formMemo}
                    onChange={(e) => setFormMemo(e.target.value)}
                    placeholder="Provide a brief explanation of academic or extra-curricular merits for the Office of Student Affairs."
                    className="w-full resize-none rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-3 text-xs text-[#1E1B19] placeholder:text-[#9A8B88] focus:bg-white focus:border-[#651C32] focus:outline-none transition"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#651C32] px-6 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#521325] active:scale-95 cursor-pointer"
                >
                  <span>Submit for SAO Approval</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            </div>

            {/* RIGHT: Instant Broadcast Composer */}
            <div
              id="broadcast-composer"
              className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#ECE5DF] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5 scroll-mt-24"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6B68]">
                    STUDENT COMMS
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F7F0] px-2 py-0.5 text-[10px] font-bold text-[#0E6245]">
                    <span className="size-1.5 rounded-full bg-[#0E6245]" />
                    Bot Gateway Online
                  </span>
                </div>
                <h3
                  className="text-[24px] font-bold text-[#651C32] leading-tight mt-1"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  Instant Broadcast Composer
                </h3>
                <p className="text-xs text-[#7A6B68]">
                  Send urgent room changes, meet updates, or agenda shifts straight to attendee digital devices.
                </p>
              </div>

              <div className="space-y-4">
                {/* Audience Cohort */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1B19]">Audience Cohort</label>
                  <div className="relative">
                    <select
                      value={selectedCohort}
                      onChange={(e) => setSelectedCohort(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] pl-8 pr-8 py-2 text-xs font-medium text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none transition cursor-pointer"
                    >
                      <option value="all">All Registered Students ({totalRegistered})</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({ev.registered} pax)
                        </option>
                      ))}
                    </select>
                    <Users size={14} className="pointer-events-none absolute left-3 top-2.5 text-[#8A7B78]" />
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-2.5 text-[#8A7B78]" />
                  </div>
                </div>

                {/* Delivery Channels */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1E1B19]">Delivery Channels</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveChannels((p) => ({ ...p, push: !p.push }))
                      }
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${activeChannels.push
                          ? "border-[#651C32] bg-[#FCECEF] text-[#651C32]"
                          : "border-[#ECE2DC] bg-[#FAF5F2] text-[#7A6B68]"
                        }`}
                    >
                      <Smartphone size={13} />
                      <span>In-App Push</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveChannels((p) => ({ ...p, sms: !p.sms }))
                      }
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${activeChannels.sms
                          ? "border-[#651C32] bg-[#FCECEF] text-[#651C32]"
                          : "border-[#ECE2DC] bg-[#FAF5F2] text-[#7A6B68]"
                        }`}
                    >
                      <MessageSquare size={13} />
                      <span>SMS Blast</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveChannels((p) => ({ ...p, discord: !p.discord }))
                      }
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${activeChannels.discord
                          ? "border-[#651C32] bg-[#FCECEF] text-[#651C32]"
                          : "border-[#ECE2DC] bg-[#FAF5F2] text-[#7A6B68]"
                        }`}
                    >
                      <Bot size={13} />
                      <span>Discord Bot</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B78]">
                    QUICK PRESETS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setBroadcastMessage(preset.text)}
                        className="rounded-full border border-[#ECE2DC] bg-[#FAF5F2] px-3 py-1 text-[11px] font-semibold text-[#1E1B19] transition hover:bg-[#ECE5E0] active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <span className="size-1 rounded-full bg-[#651C32]" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Broadcast Message */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#1E1B19]">Broadcast Message</label>
                    <span className="text-[10px] font-medium text-[#8A7B78]">
                      {broadcastMessage.length} / 240 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={240}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Type an announcement to send to attendees or pick a quick preset above..."
                    className="w-full resize-none rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-3 text-xs text-[#1E1B19] placeholder:text-[#9A8B88] focus:bg-white focus:border-[#651C32] focus:outline-none transition"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSendBroadcast}
                  disabled={isSendingBroadcast}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#651C32] py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#521325] active:scale-98 cursor-pointer disabled:opacity-60"
                >
                  <span>{isSendingBroadcast ? "Sending Broadcast..." : "Broadcast Now"}</span>
                  <span>🚀</span>
                </button>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION: "Participant Check-in & Live Roster"
              ================================================================ */}
          <section
            id="participant-checkin"
            className="flex flex-col gap-5 rounded-2xl border border-[#ECE5DF] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] scroll-mt-24"
          >
            {/* Header with Title and Filter Dropdown */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3
                  className="text-[24px] font-bold text-[#651C32] leading-tight"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  Participant Check-in &amp; Live Roster
                </h3>
                <p className="text-xs text-[#7A6B68]">Real-time attendance checker.</p>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                {/* Event Selector */}
                <div className="relative">
                  <select
                    value={selectedRosterEvent}
                    onChange={(e) => setSelectedRosterEvent(e.target.value)}
                    className="appearance-none rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-1.5 pr-8 text-xs font-semibold text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none transition cursor-pointer"
                  >
                    <option value="all">All Events ({roster.length} registered)</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.title}>
                        {ev.title} ({ev.registered} pax)
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-[#8A7B78]" />
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-2.5 text-[#8A7B78]" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search Student ID or Name..."
                    className="h-8 w-full sm:w-56 rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] pl-8 pr-3 text-xs text-[#1E1B19] placeholder:text-[#9A8B88] focus:bg-white focus:border-[#651C32] focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto rounded-xl border border-[#ECE2DC]">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="border-b border-[#ECE2DC] bg-[#FAF5F2] text-[10px] font-bold uppercase tracking-wider text-[#7A6B68]">
                  <tr>
                    <th className="px-4 py-3">STUDENT ATTENDEE</th>
                    <th className="px-4 py-3">STUDENT ID</th>
                    <th className="px-4 py-3">EVENT TRACK</th>
                    <th className="px-4 py-3">REGISTERED AT</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-right">GATE ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE2DC] bg-white">
                  {filteredRoster.map((student) => (
                    <tr key={student.id} className="transition hover:bg-[#FAF5F2]/50">
                      {/* Attendee */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FCECEF] text-xs font-bold text-[#8C233C]">
                            {student.initials}
                          </div>
                          <div>
                            <p className="font-bold text-[#1E1B19]">{student.name}</p>
                            <p className="text-[11px] text-[#7A6B68]">{student.yearProgram}</p>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="px-4 py-3.5 font-mono text-xs text-[#1E1B19]">
                        {student.studentId}
                      </td>

                      {/* Event Track */}
                      <td className="px-4 py-3.5 text-xs text-[#7A6B68]">
                        {student.eventTrack}
                      </td>

                      {/* Registered At */}
                      <td className="px-4 py-3.5 text-xs text-[#7A6B68]">
                        {student.registeredAt}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {student.checkedIn ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F7F0] px-2.5 py-1 text-[10px] font-bold text-[#0E6245]">
                            <span className="size-1.5 rounded-full bg-[#0E6245]" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCECEF] px-2.5 py-1 text-[10px] font-bold text-[#C4384F]">
                            <span className="size-1.5 rounded-full bg-[#C4384F]" />
                            Pending Gate
                          </span>
                        )}
                      </td>

                      {/* Gate Action */}
                      <td className="px-4 py-3.5 text-right">
                        {student.checkedIn ? (
                          <button
                            type="button"
                            onClick={() => handleToggleCheckin(student.studentId)}
                            className="rounded-lg border border-[#E8DFD8] bg-[#FAF5F2] px-3.5 py-1.5 text-xs font-semibold text-[#2C181C] transition hover:bg-[#F2ECE8] active:scale-95 cursor-pointer"
                          >
                            Undo
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleCheckin(student.studentId)}
                            className="rounded-lg bg-[#651C32] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#521325] active:scale-95 cursor-pointer"
                          >
                            Tap Check-in
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Hardware Reader Fallback & NFC Tap Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#ECE2DC] bg-white text-[#651C32] shadow-2xs">
                  <Terminal size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1E1B19]">
                    Hardware Reader Fallback &amp; NFC Tap Active
                  </p>
                  <p className="text-[11px] text-[#7A6B68]">
                    Connected to Gate Beacon A-8 • 9ms latency sync enabled
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateNfcTap}
                disabled={nfcSimulating}
                className="flex items-center gap-2 rounded-xl border border-[#ECE2DC] bg-white px-4 py-2 text-xs font-semibold text-[#651C32] shadow-2xs transition hover:bg-[#FAF5F2] active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Zap size={13} className={nfcSimulating ? "animate-spin text-[#651C32]" : "text-[#651C32]"} />
                <span>{nfcSimulating ? "Scanning NFC..." : "Simulate NFC Tap / Scan"}</span>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* ====================================================================
          MODAL: Quick Check-in Mode (Scanner Simulator)
          ==================================================================== */}
      {quickCheckinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE5DF]">
            <button
              onClick={() => setQuickCheckinOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#8A7B78] hover:bg-[#FAF5F2]"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#FCECEF] text-[#651C32]">
                <QrCode size={24} />
              </div>
              <h3
                className="text-2xl font-bold text-[#651C32]"
                style={{
                  fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                }}
              >
                Quick Check-in Mode
              </h3>
              <p className="mt-1 text-xs text-[#7A6B68]">
                Fast camera barcode &amp; student QR code scanner simulation.
              </p>

              {/* Viewport Target */}
              <div className="relative my-5 flex aspect-square w-64 items-center justify-center rounded-2xl border-2 border-dashed border-[#651C32] bg-[#FAF5F2]">
                <div className="flex flex-col items-center">
                  <Zap size={40} className="animate-pulse text-[#651C32]" />
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#8A7B78]">
                    Ready for student pass
                  </p>
                </div>
                {/* Visual Scanner corners */}
                <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-[#651C32]" />
                <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#651C32]" />
                <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#651C32]" />
                <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#651C32]" />
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2">
                <button
                  onClick={() => {
                    handleSimulateNfcTap();
                    setQuickCheckinOpen(false);
                  }}
                  className="w-full rounded-xl bg-[#651C32] py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#521325] cursor-pointer"
                >
                  Scan Attendee Pass (Instant Tap)
                </button>
                <button
                  onClick={() => setQuickCheckinOpen(false)}
                  className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] py-2 text-xs font-semibold text-[#7A6B68] hover:bg-[#ECE5E0] cursor-pointer"
                >
                  Done / Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: Edit Event Modal
          ==================================================================== */}
      {editModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE5DF]">
            <button
              onClick={() => setEditModalEvent(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#8A7B78] hover:bg-[#FAF5F2]"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4384F]">
                  REGISTRY EDITOR
                </span>
                <h3
                  className="text-2xl font-bold text-[#651C32]"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  Edit Event Details
                </h3>
                <p className="text-xs text-[#7A6B68]">
                  Update event parameters, venues, or seat allocations.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#1E1B19]">Title</label>
                  <input
                    type="text"
                    value={editModalEvent.title}
                    onChange={(e) =>
                      setEditModalEvent({ ...editModalEvent, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 text-xs font-medium text-[#1E1B19]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1E1B19]">Venue</label>
                  <input
                    type="text"
                    value={editModalEvent.venue}
                    onChange={(e) =>
                      setEditModalEvent({ ...editModalEvent, venue: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 text-xs font-medium text-[#1E1B19]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1E1B19]">Capacity</label>
                    <input
                      type="number"
                      value={editModalEvent.cap}
                      onChange={(e) =>
                        setEditModalEvent({
                          ...editModalEvent,
                          cap: Number(e.target.value) || 100,
                        })
                      }
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 text-xs font-medium text-[#1E1B19]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1E1B19]">Status</label>
                    <select
                      value={editModalEvent.status}
                      onChange={(e) =>
                        setEditModalEvent({
                          ...editModalEvent,
                          status: e.target.value as EventStatus,
                        })
                      }
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3 py-2 text-xs font-medium text-[#1E1B19]"
                    >
                      <option value="live">Live • Approved</option>
                      <option value="soldout">Sold Out • Full</option>
                      <option value="pending">Pending SAO Clearance</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalEvent(null)}
                  className="rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-4 py-2 text-xs font-semibold text-[#7A6B68] hover:bg-[#ECE5E0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEvents((prev) =>
                      prev.map((e) => (e.id === editModalEvent.id ? editModalEvent : e))
                    );
                    setEditModalEvent(null);
                    showToast("✓ Event changes saved and published to registry.");
                  }}
                  className="rounded-xl bg-[#651C32] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#521325]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: Broadcast Reach Logs
          ==================================================================== */}
      {logsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE5DF]">
            <button
              onClick={() => setLogsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#8A7B78] hover:bg-[#FAF5F2]"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#E5F7F0] p-2 text-[#0E6245]">
                  <Radio size={18} />
                </div>
                <div>
                  <h3
                    className="text-xl font-bold text-[#651C32]"
                    style={{
                      fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                    }}
                  >
                    Broadcast Delivery Logs
                  </h3>
                  <p className="text-xs text-[#7A6B68]">
                    Last 24 hours of campus announcements and SMS gateways.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#ECE2DC] rounded-xl border border-[#ECE2DC] text-xs max-h-64 overflow-y-auto">
                {broadcastLogs.length > 0 ? (
                  broadcastLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-white flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-[#1E1B19]">{log.message}</p>
                        <p className="text-[10px] text-[#7A6B68] mt-0.5">
                          {log.cohortLabel} · {log.sentAt}
                        </p>
                      </div>
                      <span className="text-[#0E6245] font-bold shrink-0">
                        {log.recipientCount} Delivered
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#7A6B68] bg-[#FAF5F2]">
                    No broadcasts recorded yet.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setLogsModalOpen(false)}
                  className="rounded-xl bg-[#651C32] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#521325]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
