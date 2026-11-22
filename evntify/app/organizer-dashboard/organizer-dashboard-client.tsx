"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleCheckIn, updateEvent, cancelEvent, checkInByTicketCode } from "@/app/actions/events";
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
  Zap,
} from "lucide-react";

/* ==========================================================================
   Data Types & Initial State (matching Figma Mockup)
   ========================================================================== */

// Local alias for the imported type
type EventItem = OrgEvent;



export type RosterStudent = OrgRosterStudent;

// INITIAL_EVENTS replaced by props (see page.tsx)

// INITIAL_ROSTER replaced by props (see page.tsx)

const QUICK_PRESETS = [
  {
    id: "doors-open",
    label: "Doors open 15m",
    text: "Doors open in 15 mins! Have your student QR codes ready for fast gate tap at Tan Yan Kee 11th Flr.",
  },
  {
    id: "swag-booth",
    label: "Swag at Booth",
    text: "Limited edition LITS sticker packs & lanyards are now available at Booth #4 foyer. Claim with your event pass!",
  },
  {
    id: "room-change",
    label: "Room Change",
    text: "Notice: The workshop breakout session has been relocated to Computer Lab 204. Please proceed calmly.",
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
  venues?: Array<{ id: string; name: string; capacity: number }>;
}

export default function OrganizerDashboardClient({
  initialEvents = [],
  initialRoster = [],
  organizerName = "Organizer",
  orgName = "My Organisation",
  venues = [],
}: OrganizerDashboardClientProps) {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [registryFilter, setRegistryFilter] = useState<string>("all");
  const [ticketInputCode, setTicketInputCode] = useState("");
  const [ticketScanResult, setTicketScanResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [ticketScanning, setTicketScanning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // App Data
  const [events, setEvents] = useState<OrgEvent[]>(initialEvents);
  const [roster, setRoster] = useState<OrgRosterStudent[]>(initialRoster);
  const [broadcastMessage, setBroadcastMessage] = useState(
    "Doors open in 15 mins! Have your student QR codes ready for fast gate tap at Tan Yan Kee 11th Flr."
  );
  const [activeChannels, setActiveChannels] = useState<{ [key: string]: boolean }>({
    push: true,
    sms: true,
    discord: true,
  });
  const [selectedCohort, setSelectedCohort] = useState<string>(
    initialEvents[0]?.id ?? ""
  );
  const [selectedRosterEvent, setSelectedRosterEvent] = useState(
    "LITS General Assembly (400 pax)"
  );
  const [rosterSearch, setRosterSearch] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");

  // Notification / Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nfcSimulating, setNfcSimulating] = useState(false);

  // Modal State
  const router = useRouter();
  const [quickCheckinOpen, setQuickCheckinOpen] = useState(false);
  // const [qrModalEvent, setQrModalEvent] = useState<EventItem | null>(null);
  const [editModalEvent, setEditModalEvent] = useState<EventItem | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editResubmit, setEditResubmit] = useState(false);
  const [editResubmitMemo, setEditResubmitMemo] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [cancellingEvent, setCancellingEvent] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
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

    // Find the target event by ID or fallback to the first active event
    const targetEvent = events.find((ev) => ev.id === selectedCohort) || events[0];
    if (!targetEvent) {
      showToast("Broadcast failed: No active events found to broadcast to. Create or select an event first.");
      return;
    }

    setIsSendingBroadcast(true);
    const res = await sendBroadcast({
      eventId: targetEvent.id,
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
      list = list.filter((e) => e.status === "live" || e.status === "soldout");
    } else if (registryFilter === "needs_action") {
      list = list.filter((e) => e.status === "returned");
    } else if (registryFilter === "sao") {
      list = list.filter((e) => e.status === "pending");
    } else if (registryFilter === "archived") {
      list = list.filter((e) => e.status === "archived" || e.status === "completed" || e.status === "cancelled" || e.status === "declined");
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
    const q = rosterSearch.toLowerCase().trim();
    if (!q) return roster;
    return roster.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.eventTrack.toLowerCase().includes(q) ||
        s.yearProgram.toLowerCase().includes(q)
    );
  }, [roster, rosterSearch]);

  const checkedInCount = roster.filter((s) => s.checkedIn).length;

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
              <Image
                src="/eventifytxt-cropped.svg"
                alt="eventify."
                width={120}
                height={34}
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
              onClick={() => showToast("🔔 3 unread alerts: SAO cleared LITS General Assembly, 2 new RSVPs.")}
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
                LT
              </button>
              {profileDropdownOpen && (
                <ProfileDropdown
                  name={
                    user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    user?.email?.split("@")[0] ||
                    "Organizer"
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
                <span className="font-semibold text-[#1E1B19]">LITS Executive Board</span>
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
                  +24% vs lw
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
                  <span>total</span>
                  <span>cap</span>
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[11px] font-medium text-[#7A6B68]">
                  <span>Campus Hall Utilization</span>
                  <span className="font-bold text-[#1E1B19]">—</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#F2ECE8] overflow-hidden">
                  <div className="h-full w-0 rounded-full bg-[#651C32]" />
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
                  6 operating now
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span
                  className="text-[40px] font-semibold leading-none text-[#1E1B19] tracking-tight"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  03
                </span>
                <span className="text-xs font-medium text-[#7A6B68] leading-tight">
                  venues booked
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8C233C]">
                <span className="size-2 rounded-full bg-[#8C233C]" />
                <span>Tan Yan Kee Conf Hall is nearing!</span>
              </div>
            </div>

            {/* Card 3: SAO APPROVAL QUEUE */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#ECE5DF] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[160px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B78]">
                  SAO APPROVAL QUEUE
                </span>
                <span className="rounded-full bg-[#FDF0E8] px-2 py-0.5 text-[10px] font-bold text-[#C4384F]">
                  Priority
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span
                  className="text-[40px] font-semibold leading-none text-[#1E1B19] tracking-tight"
                  style={{
                    fontFamily: "var(--font-playfair), var(--font-newsreader), Georgia, serif",
                  }}
                >
                  01
                </span>
                <span className="text-xs font-medium text-[#7A6B68] leading-tight">
                  in dean review
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#7A6B68] font-medium">
                <Clock size={12} className="text-[#8A7B78]" />
                <span>Est. Turnaround ~4.2 hrs</span>
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
                  —
                </span>
                <span className="text-xs font-medium text-[#7A6B68] leading-tight">
                  students
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-[#0E6245]">
                  <span className="size-1.5 rounded-full bg-[#0E6245]" />
                  — SMS / Bot
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
                  onClick={() => setRegistryFilter("needs_action")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${registryFilter === "needs_action"
                    ? "bg-[#D97706] text-white shadow-2xs"
                    : "text-[#B45309] hover:text-[#78350F]"
                    }`}
                >
                  Needs Attention ({events.filter((e) => e.status === "returned").length})
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
                  Archived ({events.filter((e) => e.status === "archived" || e.status === "completed" || e.status === "cancelled" || e.status === "declined").length})
                </button>
              </div>
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((evt) => {
                const percent = Math.min(100, Math.round((evt.registered / (evt.cap > 0 ? evt.cap : 1)) * 100));

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

                        {/* Status Badges */}
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
                        {evt.status === "returned" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-bold text-[#D97706]">
                            <span className="size-1.5 rounded-full bg-[#D97706]" />
                            {evt.badgeLabel}
                          </span>
                        )}
                        {evt.status === "declined" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[10px] font-bold text-[#DC2626]">
                            <span className="size-1.5 rounded-full bg-[#DC2626]" />
                            {evt.badgeLabel}
                          </span>
                        )}
                        {evt.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]">
                            <span className="size-1.5 rounded-full bg-[#4B5563]" />
                            {evt.badgeLabel}
                          </span>
                        )}
                        {(evt.status === "completed" || evt.status === "archived") && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5EFEB] px-2.5 py-1 text-[10px] font-bold text-[#7A6B68]">
                            <span className="size-1.5 rounded-full bg-[#7A6B68]" />
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

                      {/* Reviewer Note for Returned proposals */}
                      {evt.status === "returned" && evt.decisionNote && (
                        <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-2.5 text-xs text-[#92400E]">
                          <p className="font-semibold text-[11px] uppercase tracking-wider text-[#B45309] mb-0.5">
                            SAO Reviewer Note:
                          </p>
                          <p className="leading-relaxed">{evt.decisionNote}</p>
                        </div>
                      )}

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
                          setEditError(null);
                          setEditDate(evt.rawDate || "");
                          setEditStartTime(evt.rawStartTime || "");
                          setEditEndTime(evt.rawEndTime || "");
                          setEditCategory(evt.category || "");
                          setEditDescription(evt.description || "");
                          setEditResubmit(evt.status === "returned");
                          setEditResubmitMemo("");
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
                    <span>OFFICIAL PROPOSAL FILING</span>
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
                    Direct routing to Student Affairs Office. Approvals sync automatically with campus calendar.
                  </p>
                </div>
                <div className="rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-2 text-[#651C32]">
                  <Sparkles size={16} />
                </div>
              </div>

              <div className="rounded-xl border border-[#F0E6E1] bg-[#FAF5F2] p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-[#1E1B19]">Standard Event Proposal Portal</h4>
                  <p className="text-xs text-[#7A6B68] leading-relaxed">
                    Event proposals require venue clearance, schedule buffers, ticketing tier selection, and SAO administrative review before publishing to the campus directory.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Link
                    href="/organizer-dashboard/create-event"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#651C32] px-5 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#521325] active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Open Full Event Proposal Form</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#7A6B68]">
                <Clock size={13} className="text-[#651C32]" />
                <span>Standard SAO turnaround is 3-5 business days. Submit at least 7 days before event date.</span>
              </div>
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
                  <label className="text-xs font-semibold text-[#1E1B19]">Audience Cohort (Event Registrants)</label>
                  <div className="relative">
                    <select
                      value={selectedCohort}
                      onChange={(e) => setSelectedCohort(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] pl-8 pr-8 py-2 text-xs font-medium text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none transition cursor-pointer"
                    >
                      {events.length > 0 ? (
                        events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} ({ev.registered ?? 0} registered)
                          </option>
                        ))
                      ) : (
                        <option value="">No active events found</option>
                      )}
                    </select>
                    <Users size={14} className="pointer-events-none absolute left-3 top-2.5 text-[#8A7B78]" />
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-2.5 text-[#8A7B78]" />
                  </div>
                </div>

                {/* Delivery Channels — only In-App Push is implemented */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1E1B19]">Delivery Channels</label>
                  <div className="grid grid-cols-1 gap-2">
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
                    <option value="LITS General Assembly (400 pax)">LITS General Assembly (400 pax)</option>
                    <option value="LITS Figma Sprint (50 pax)">LITS Figma Sprint (50 pax)</option>
                    <option value="Mr & Ms University (300 pax)">Mr &amp; Ms University (300 pax)</option>
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
              <div className="w-full space-y-3">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!ticketInputCode.trim()) return;
                    setTicketScanning(true);
                    setTicketScanResult(null);

                    // Pick active or first event
                    const targetEvent = events.find((ev) => ev.status === "live" || ev.status === "soldout") ?? events[0];
                    if (!targetEvent) {
                      setTicketScanResult({ success: false, message: "No event found to check into." });
                      setTicketScanning(false);
                      return;
                    }

                    const res = await checkInByTicketCode(ticketInputCode.trim(), targetEvent.id);
                    setTicketScanning(false);
                    if (res.error) {
                      setTicketScanResult({ success: false, message: res.error });
                    } else {
                      setTicketScanResult({
                        success: true,
                        message: `Checked in ${res.studentName ?? "student"} (${res.studentNumber ?? "ID"}) at ${res.checkedInTime}`,
                      });
                      setTicketInputCode("");
                    }
                  }}
                  className="space-y-2 text-left"
                >
                  <label className="block text-xs font-semibold text-[#5A4B48]">
                    Scan or Enter Ticket Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ticketInputCode}
                      onChange={(e) => setTicketInputCode(e.target.value.toUpperCase())}
                      placeholder="e.g. EVT-ABCD-1234"
                      className="flex-1 rounded-xl border border-[#E4D9D2] bg-white px-3 py-2 text-xs font-mono font-semibold uppercase text-[#1E1B19] focus:outline-none focus:border-[#651C32]"
                    />
                    <button
                      type="submit"
                      disabled={ticketScanning || !ticketInputCode.trim()}
                      className="rounded-xl bg-[#651C32] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#521325] disabled:opacity-50 cursor-pointer"
                    >
                      {ticketScanning ? "Checking..." : "Verify & Check In"}
                    </button>
                  </div>
                </form>

                {ticketScanResult && (
                  <div
                    className={`rounded-xl p-2.5 text-xs font-medium text-left ${ticketScanResult.success
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border border-rose-200 bg-rose-50 text-rose-800"
                      }`}
                  >
                    {ticketScanResult.message}
                  </div>
                )}

                <button
                  onClick={() => {
                    setQuickCheckinOpen(false);
                    setTicketScanResult(null);
                  }}
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
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE5DF] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditModalEvent(null);
                setEditError(null);
              }}
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

              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                  {editError}
                </div>
              )}

              {editModalEvent.status === "returned" && editModalEvent.decisionNote && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <b>SAO Reviewer Note:</b> {editModalEvent.decisionNote}
                </div>
              )}

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
                  {venues && venues.length > 0 ? (
                    <select
                      value={venues.find((v) => v.name === editModalEvent.venue)?.id || ""}
                      onChange={(e) => {
                        const sel = venues.find((v) => v.id === e.target.value);
                        if (sel) {
                          setEditModalEvent({ ...editModalEvent, venue: sel.name });
                        }
                      }}
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3 py-2 text-xs font-medium text-[#1E1B19]"
                    >
                      <option value="">{editModalEvent.venue || "Select a venue..."}</option>
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (Max {v.capacity} pax)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editModalEvent.venue}
                      onChange={(e) =>
                        setEditModalEvent({ ...editModalEvent, venue: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 text-xs font-medium text-[#1E1B19]"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1E1B19]">Category</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="e.g. Workshop, Seminar"
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 text-xs font-medium text-[#1E1B19]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1E1B19]">Status</label>
                    <div className="rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3 py-2 text-xs font-medium text-[#7A6B68]">
                      {editModalEvent.badgeLabel}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1E1B19]">Description</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Describe the event..."
                    className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-3.5 py-2 text-xs font-medium text-[#1E1B19]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[#1E1B19]">Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-2 py-2 text-xs font-medium text-[#1E1B19]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1E1B19]">Start Time</label>
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-2 py-2 text-xs font-medium text-[#1E1B19]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1E1B19]">End Time</label>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-2 py-2 text-xs font-medium text-[#1E1B19]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1E1B19]">
                    Capacity (Floor: {editModalEvent.registered})
                  </label>
                  <input
                    type="number"
                    min={editModalEvent.registered || 1}
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

                {editModalEvent.status === "returned" && (
                  <div className="space-y-2 border-t border-[#ECE5DF] pt-3">
                    <label className="block text-xs font-bold text-[#651C32]">
                      Resubmission Note for SAO Reviewer
                    </label>
                    <textarea
                      value={editResubmitMemo}
                      onChange={(e) => setEditResubmitMemo(e.target.value)}
                      placeholder="Detail what changes were made in response to reviewer comments..."
                      className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-2.5 text-xs text-[#1E1B19]"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#ECE5DF]">
                {editModalEvent.status !== "cancelled" && editModalEvent.status !== "completed" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelReason("");
                      setCancelModalOpen(true);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                  >
                    Cancel Event
                  </button>
                ) : <span />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModalEvent(null);
                      setEditError(null);
                    }}
                    className="rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] px-4 py-2 text-xs font-semibold text-[#7A6B68] hover:bg-[#ECE5E0]"
                    disabled={editSaving}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={editSaving}
                    onClick={async () => {
                      setEditSaving(true);
                      setEditError(null);

                      const vObj = venues.find((v) => v.name === editModalEvent.venue);
                      const isReturned = editModalEvent.status === "returned";
                      const res = await updateEvent({
                        eventId: editModalEvent.id,
                        title: editModalEvent.title,
                        venueId: vObj?.id,
                        category: editCategory || undefined,
                        description: editDescription || undefined,
                        capacity: editModalEvent.cap,
                        date: editDate || undefined,
                        startTime: editStartTime || undefined,
                        endTime: editEndTime || undefined,
                        resubmitForReview: isReturned || editResubmit,
                        resubmitMemo: editResubmitMemo || undefined,
                      });

                      setEditSaving(false);
                      if (res.error) {
                        setEditError(res.error);
                      } else {
                        setEditModalEvent(null);
                        showToast(isReturned ? "✓ Resubmitted to SAO for review." : "✓ Event changes saved successfully.");
                        router.refresh();
                      }
                    }}
                    className="rounded-xl bg-[#651C32] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#521325] disabled:opacity-50"
                  >
                    {editSaving ? "Saving..." : editModalEvent.status === "returned" ? "Save & Resubmit to SAO" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: Cancel Event Confirmation
          ==================================================================== */}
      {cancelModalOpen && editModalEvent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-red-200">
            <h3 className="text-lg font-bold text-red-700">Cancel Event</h3>
            <p className="mt-1 text-xs text-neutral-600">
              Are you sure you want to cancel &ldquo;{editModalEvent.title}&rdquo;? All active registrants will be notified, and registered spots will be released.
            </p>
            <div className="mt-3">
              <label className="text-xs font-semibold text-neutral-700">Reason for cancellation:</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Inclement weather / schedule postponement..."
                className="mt-1 w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900"
                rows={3}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={cancellingEvent}
                onClick={() => setCancelModalOpen(false)}
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                disabled={cancellingEvent}
                onClick={async () => {
                  if (!cancelReason.trim()) {
                    showToast("Please provide a reason for cancelling the event.");
                    return;
                  }
                  setCancellingEvent(true);
                  const res = await cancelEvent(editModalEvent.id, cancelReason);
                  setCancellingEvent(false);
                  if (res.error) {
                    showToast(`Error: ${res.error}`);
                  } else {
                    setCancelModalOpen(false);
                    setEditModalEvent(null);
                    setEvents((prev) =>
                      prev.map((e) =>
                        e.id === editModalEvent.id
                          ? { ...e, status: "cancelled", badgeLabel: "Cancelled" }
                          : e
                      )
                    );
                    showToast("Event cancelled and registrants notified.");
                  }
                }}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancellingEvent ? "Cancelling..." : "Confirm Cancellation"}
              </button>
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
