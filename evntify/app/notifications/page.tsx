"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Ticket,
  Clock,
  Palette,
  Megaphone,
  Check,
  CheckCheck,
  MoreHorizontal,
  FileText,
  AlertCircle,
  Plus,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import Header from "@/component/user-profile/Header";
import RoleGuard from "@/component/auth/role-guard";

type Notification = {
  id: string;
  unread: boolean;
  tone: "rose" | "mint" | "sand";
  icon: LucideIcon;
  badgeIcon?: LucideIcon;
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  title: string;
  body: string;
  time: string;
  dept: string;
  actions?: {
    primary?: {
      label: string;
      icon?: LucideIcon;
      variant?: "maroon" | "green";
      href?: string;
    };
    secondary?: {
      label: string;
      href?: string;
    };
  };
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    unread: true,
    tone: "rose",
    icon: MapPin,
    badgeText: "!",
    badgeBg: "#4D0011",
    badgeColor: "#ffffff",
    title: "Venue Relocation:",
    body: "LITS General Assembly moved from 4th Flr Audio-Visual to 11th Flr Auditorium B due to high cohort registration.",
    time: "10m ago",
    dept: "DEPT. OF COMPUTER STUDIES",
    actions: {
      primary: {
        label: "View Updated Ticket",
        icon: Ticket,
        variant: "maroon",
        href: "/events",
      },
    },
  },
  {
    id: "2",
    unread: true,
    tone: "mint",
    icon: Ticket,
    badgeIcon: Check,
    badgeBg: "#083F31",
    badgeColor: "#BAEED9",
    title: "Ticket Confirmed:",
    body: "Your seat pass for Mister & Miss University of the East 2025 is now generated and linked to your student ID.",
    time: "45m ago",
    dept: "UNIVERSITY CULTURAL GUILD",
    actions: {
      primary: {
        label: "View Pass",
        icon: Ticket,
        variant: "maroon",
        href: "/my-events",
      },
    },
  },
  {
    id: "3",
    unread: false,
    tone: "sand",
    icon: Clock,
    badgeIcon: Plus,
    badgeBg: "#FFDAD6",
    badgeColor: "#BA1A1A",
    title: "Waitlist Granted:",
    body: "A workstation seat opened up for High-Bay Tech Lab Sprint. Confirmation window holds for 30 minutes.",
    time: "2h ago",
    dept: "COLLEGE OF ENGINEERING",
    actions: {
      primary: {
        label: "Claim Seat (Expires in 30m)",
        icon: Clock,
        variant: "green",
        href: "/events",
      },
      secondary: {
        label: "Decline",
      },
    },
  },
  {
    id: "4",
    unread: false,
    tone: "rose",
    icon: Palette,
    title: "Art Exhibit Perks:",
    body: "Canvas tote bag and commemorative token pass are ready for claiming at Sining Silangan Atrium Gallery.",
    time: "5h ago",
    dept: "FINE ARTS STUDENT COUNCIL",
  },
  {
    id: "5",
    unread: false,
    tone: "sand",
    icon: Megaphone,
    title: "SAO Official Advisory:",
    body: "Inclement Weather Contingency protocol activated for weekend Campus Quad Festivities. Outdoor booths transitioned to the South Concourse.",
    time: "Yesterday",
    dept: "STUDENT AFFAIRS OFFICE",
    actions: {
      secondary: {
        label: "Download Memo (PDF)",
      },
    },
  },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = items.filter((n) => n.unread).length;
  const visible = filter === "unread" ? items.filter((n) => n.unread) : items;
  const fresh = visible.filter((n) => n.unread);
  const earlier = visible.filter((n) => !n.unread);

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleReadStatus = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  return (
    <RoleGuard allowedRole="user">
      <div className="min-h-screen flex flex-col bg-white text-[#1E1B19] font-sans">
        <Header />

        <main className="flex-1 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="w-full max-w-[760px] flex flex-col gap-5">
            {/* Back to My Events Button in top left */}
            <div className="flex items-center justify-start">
              <Link
                href="/my-events"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8C4B56] hover:text-[#4D0011] bg-[#FAF2EE] hover:bg-[#F4ECE8] border border-[#E9E1DD] transition cursor-pointer group shadow-2xs"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                <span>Back to My Events</span>
              </Link>
            </div>

            {/* Top row: Title + Actions */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <h1 className="font-[family-name:var(--font-newsreader)] text-3xl sm:text-[38px] font-normal tracking-[-0.6px] text-[#4D0011]">
                Notifications
              </h1>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C4B56] hover:text-[#4D0011] transition cursor-pointer py-1 px-2 rounded-md hover:bg-[#FAF2EE]"
                >
                  <CheckCheck size={14} className="stroke-[2.2]" />
                  <span>Mark all as read</span>
                </button>

                <div className="flex size-7 items-center justify-center rounded-full bg-[#4D0011] text-white shadow-xs">
                  <span className="text-[11px] font-bold">A</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs: All / Unread */}
            <div className="flex items-center gap-2" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={filter === "all"}
                onClick={() => setFilter("all")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition cursor-pointer ${
                  filter === "all"
                    ? "bg-[#4D0011] text-white shadow-xs"
                    : "bg-[#FAF2EE] text-[#554243] hover:bg-[#F4ECE8]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === "unread"}
                onClick={() => setFilter("unread")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition cursor-pointer ${
                  filter === "unread"
                    ? "bg-[#4D0011] text-white shadow-xs"
                    : "bg-[#FAF2EE] text-[#554243] hover:bg-[#F4ECE8]"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center size-4 rounded-full text-[10px] font-bold ${
                      filter === "unread"
                        ? "bg-white text-[#4D0011]"
                        : "bg-[#4D0011] text-white"
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications Feed */}
            <div className="flex flex-col gap-8 pt-1">
              {/* NEW Section */}
              {fresh.length > 0 && (
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold tracking-[0.6px] uppercase text-[#887272]">
                      NEW
                    </span>
                    <span className="text-xs font-medium text-[#8C4B56]">
                      {fresh.length} update{fresh.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {fresh.map((n) => (
                      <NotificationCard
                        key={n.id}
                        n={n}
                        onDismiss={handleDismiss}
                        onToggleRead={toggleReadStatus}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* EARLIER Section */}
              {earlier.length > 0 && (
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold tracking-[0.6px] uppercase text-[#887272]">
                      EARLIER
                    </span>
                    <span className="text-xs text-[#887272]">Past 48 hours</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {earlier.map((n) => (
                      <NotificationCard
                        key={n.id}
                        n={n}
                        onDismiss={handleDismiss}
                        onToggleRead={toggleReadStatus}
                      />
                    ))}
                  </div>
                </section>
              )}

              {visible.length === 0 && (
                <div className="py-16 text-center text-sm text-[#887272]">
                  You&apos;re all caught up. No notifications found.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer matching Image 2 */}
        <footer className="border-t border-[#F2E9E4] bg-white py-8 px-6 sm:px-12 mt-12">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#554243]">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <Link href="/my-events">
                <img
                  src="/eventifytxt-cropped.svg"
                  alt="Eventify"
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <span className="text-[#887272]">
                © 2025 Eventify Campus Inc. All rights reserved. Connecting university life & student culture.
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-[#554243] font-medium">
              <Link href="/#about" className="hover:text-[#4D0011] transition">
                Privacy Policy
              </Link>
              <Link href="/#about" className="hover:text-[#4D0011] transition">
                Terms of Service
              </Link>
              <Link href="/events" className="hover:text-[#4D0011] transition">
                Event Directory
              </Link>
              <Link href="/#about" className="hover:text-[#4D0011] transition">
                Academic Colleges
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </RoleGuard>
  );
}

function NotificationCard({
  n,
  onDismiss,
  onToggleRead,
}: {
  n: Notification;
  onDismiss: (id: string) => void;
  onToggleRead: (id: string) => void;
}) {
  const Icon = n.icon;
  const BadgeIcon = n.badgeIcon;
  const PrimaryIcon = n.actions?.primary?.icon;

  const toneIconStyles = {
    rose: "bg-[#FFD9DD] text-[#BA1A1A]",
    mint: "bg-[#BAEED9] text-[#083F31]",
    sand: "bg-[#EEE7E3] text-[#554243]",
  }[n.tone];

  return (
    <div
      className={`relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-150 ${
        n.unread
          ? "bg-white border-[#F2E9E4] shadow-[0_2px_8px_rgba(77,0,17,0.04)]"
          : "bg-white/95 border-[#F2E9E4] hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
      }`}
    >
      {/* Icon with status badge */}
      <div className="relative shrink-0">
        <div
          className={`flex size-12 items-center justify-center rounded-full ${toneIconStyles}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        {/* Status mini badge */}
        {(n.badgeIcon || n.badgeText) && (
          <div
            style={{
              backgroundColor: n.badgeBg || "#4D0011",
              color: n.badgeColor || "#ffffff",
            }}
            className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full ring-2 ring-white text-[10px] font-bold"
          >
            {BadgeIcon ? <BadgeIcon size={10} strokeWidth={2.6} /> : n.badgeText}
          </div>
        )}
      </div>

      {/* Main copy */}
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[14.5px] leading-[22px] text-[#1E1B19]">
          <strong className="font-bold text-[#1E1B19]">{n.title} </strong>
          <span className="font-normal text-[#1E1B19]">{n.body}</span>
        </p>

        {/* Timestamp & Department / Source */}
        <div className="flex items-center gap-2 text-xs text-[#887272] mt-1.5 font-medium">
          <span>{n.time}</span>
          <span className="text-[10px]">•</span>
          <span className="uppercase text-[10.5px] tracking-wider font-bold text-[#887272]">
            {n.dept}
          </span>
        </div>

        {/* Action buttons */}
        {n.actions && (
          <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
            {n.actions.primary && (
              n.actions.primary.href ? (
                <Link
                  href={n.actions.primary.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs ${
                    n.actions.primary.variant === "green"
                      ? "bg-[#083F31] text-white hover:bg-[#00281D]"
                      : "bg-[#4D0011] text-white hover:bg-[#6C0C28]"
                  }`}
                >
                  {PrimaryIcon && <PrimaryIcon size={13} />}
                  <span>{n.actions.primary.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs ${
                    n.actions.primary.variant === "green"
                      ? "bg-[#083F31] text-white hover:bg-[#00281D]"
                      : "bg-[#4D0011] text-white hover:bg-[#6C0C28]"
                  }`}
                >
                  {PrimaryIcon && <PrimaryIcon size={13} />}
                  <span>{n.actions.primary.label}</span>
                </button>
              )
            )}

            {n.actions.secondary && (
              <button
                type="button"
                onClick={() => onDismiss(n.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#554243] bg-[#FAF2EE] hover:bg-[#F4ECE8] border border-[#E9E1DD] transition cursor-pointer"
              >
                {n.actions.secondary.label === "Download Memo (PDF)" && (
                  <FileText size={13} />
                )}
                <span>{n.actions.secondary.label}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Trailing: Unread dot + Menu */}
      <div className="flex items-center gap-3 shrink-0 pt-0.5">
        {n.unread && (
          <span
            className="size-2.5 rounded-full bg-[#BA1A1A] shrink-0"
            aria-label="Unread notification"
          />
        )}
        <button
          type="button"
          onClick={() => onToggleRead(n.id)}
          title={n.unread ? "Mark as read" : "Mark as unread"}
          className="text-[#887272] hover:text-[#1E1B19] p-1 rounded-md hover:bg-[#FAF2EE] transition cursor-pointer"
          aria-label={`Options for ${n.title}`}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
