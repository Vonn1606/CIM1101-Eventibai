"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Shield,
  FileText,
  Megaphone,
  Check,
  CheckCheck,
  MoreHorizontal,
  Download,
  Lock,
  type LucideIcon,
} from "lucide-react";

type AdminNotification = {
  id: string;
  unread: boolean;
  iconBg: string;
  iconColor: string;
  icon: LucideIcon;
  badgeBg: string;
  badgeColor?: string;
  badgeIcon: LucideIcon;
  renderTitle: () => React.ReactNode;
  time: string;
  meta: string;
  actions?: {
    primary?: {
      label: string;
      bg: string;
      color?: string;
      href?: string;
      icon?: LucideIcon;
    };
    secondary?: {
      label: string;
      bg: string;
      color?: string;
      href?: string;
      icon?: LucideIcon;
    };
  };
};

const INITIAL_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "adm-1",
    unread: true,
    iconBg: "#FFDAD6",
    iconColor: "#BA1A1A",
    icon: AlertTriangle,
    badgeBg: "#4D0011",
    badgeColor: "#ffffff",
    badgeIcon: AlertTriangle,
    renderTitle: () => (
      <span>
        <span className="font-semibold text-[#4D0011]">Facility Collision Alert:</span>{" "}
        <span className="text-[#1E1B19]">Dual reservation registered at </span>
        <strong className="font-semibold text-[#1E1B19]">
          Lucio Tan Innovation Hub (Hall B)
        </strong>{" "}
        <span className="text-[#1E1B19]">between </span>
        <strong className="font-semibold text-[#1E1B19]">
          Society of Mechanical Engineers
        </strong>{" "}
        <span className="text-[#1E1B19]">and </span>
        <strong className="font-semibold text-[#1E1B19]">
          Junior FinTech Consortium
        </strong>{" "}
        <span className="text-[#1E1B19]">for Friday, 16:00.</span>
      </span>
    ),
    time: "8 mins ago",
    meta: "REF: #SAO-FAC-8891",
    actions: {
      primary: {
        label: "Resolve Venue Conflict",
        bg: "bg-[#4D0011] text-white hover:bg-[#38000C]",
        href: "/admin/approvals",
      },
      secondary: {
        label: "Inspect Rosters",
        bg: "bg-[#F4ECE8] text-[#1E1B19] hover:bg-[#EAE1DC]",
        href: "/admin/events-directory",
      },
    },
  },
  {
    id: "adm-2",
    unread: true,
    iconBg: "#083F31",
    iconColor: "#BAEED9",
    icon: Shield,
    badgeBg: "#00281D",
    badgeColor: "#BAEED9",
    badgeIcon: Check,
    renderTitle: () => (
      <span>
        <span className="font-semibold text-[#1E1B19]">Statutory Clearance Request:</span>{" "}
        <span className="font-semibold text-[#4D0011]">
          Alumni Homecoming Gala Night
        </span>{" "}
        <span className="text-[#1E1B19]">
          (target capacity 800+ attendees) submitted complete fire marshal &amp; crowd management safety packet.
        </span>
      </span>
    ),
    time: "34 mins ago",
    meta: "REF: #SAO-PERMIT-4019",
    actions: {
      primary: {
        label: "Grant Dean Permit",
        bg: "bg-[#00281D] text-white hover:bg-[#001A13]",
        href: "/admin/approvals",
      },
      secondary: {
        label: "Request Revision",
        bg: "bg-[#F4ECE8] text-[#1E1B19] hover:bg-[#EAE1DC]",
        href: "/admin/approvals",
      },
    },
  },
  {
    id: "adm-3",
    unread: true,
    iconBg: "#FFD9DD",
    iconColor: "#BA1A1A",
    icon: Lock,
    badgeBg: "#4D0011",
    badgeColor: "#ffffff",
    badgeIcon: AlertTriangle,
    renderTitle: () => (
      <span>
        <span className="font-semibold text-[#1E1B19]">Turnstile Anomaly Flagged:</span>{" "}
        <strong className="font-semibold text-[#1E1B19]">Gate 4 Tan Yan Kee</strong>{" "}
        <span className="text-[#1E1B19]">
          reported 5 consecutive rejected entries with expired student/guest physical RFID cards within 3 minutes.
        </span>
      </span>
    ),
    time: "1 hour ago",
    meta: "LOC: TAN YAN KEE PERIMETER",
    actions: {
      primary: {
        label: "View Gate Log",
        bg: "bg-[#4D0011] text-white hover:bg-[#38000C]",
        href: "/admin",
      },
    },
  },
  {
    id: "adm-4",
    unread: false,
    iconBg: "#EEE7E3",
    iconColor: "#554243",
    icon: FileText,
    badgeBg: "#00281D",
    badgeColor: "#BAEED9",
    badgeIcon: Check,
    renderTitle: () => (
      <span>
        <span className="font-semibold text-[#1E1B19]">Mid-Year Audit Liquidation:</span>{" "}
        <strong className="font-semibold text-[#1E1B19]">
          League of Information Technology Students (LITS)
        </strong>{" "}
        <span className="text-[#1E1B19]">
          submitted reconciled Q1 Dean&apos;s Grant liquidation report with electronic invoices.
        </span>
      </span>
    ),
    time: "Yesterday at 14:22",
    meta: "DISBURSEMENT REF: #FIN-2024-81",
    actions: {
      primary: {
        label: "Mark Compliant",
        bg: "bg-[#F4ECE8] text-[#1E1B19] hover:bg-[#EAE1DC]",
      },
      secondary: {
        label: "Download Report",
        bg: "bg-[#FAF2EE] text-[#8C4B56] hover:bg-[#F4ECE8]",
        icon: Download,
      },
    },
  },
  {
    id: "adm-5",
    unread: false,
    iconBg: "#FFDADA",
    iconColor: "#4D0011",
    icon: Megaphone,
    badgeBg: "#083F31",
    badgeColor: "#BAEED9",
    badgeIcon: Check,
    renderTitle: () => (
      <span>
        <span className="font-semibold text-[#1E1B19]">Campus Broadcast Confirmation:</span>{" "}
        <span className="text-[#1E1B19]">
          Emergency Typhoon Advisory #3 successfully dispatched to{" "}
        </span>
        <strong className="font-semibold text-[#1E1B19]">
          14,200 active student &amp; faculty accounts
        </strong>{" "}
        <span className="text-[#1E1B19]">with 99.4% verified delivery rate.</span>
      </span>
    ),
    time: "2 days ago",
    meta: "SAO EMERGENCY DESK",
  },
];

export default function AdminNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<AdminNotification[]>(INITIAL_ADMIN_NOTIFICATIONS);

  const unreadCount = items.filter((n) => n.unread).length;
  const visible = filter === "unread" ? items.filter((n) => n.unread) : items;
  const fresh = visible.filter((n) => n.unread);
  const earlier = visible.filter((n) => !n.unread);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleReadStatus = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1B19] font-sans">
      {/* Top Header bar with Eventify logo */}
      <header className="sticky top-0 z-20 h-20 bg-white/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
          <Link href="/admin" className="flex items-center gap-2.5 group focus:outline-none shrink-0">
            <Image
              src="/eventifytxt-cropped.svg"
              alt="Eventify"
              width={120}
              height={36}
              className="h-9 w-auto object-contain transition transform group-hover:scale-105"
            />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-[760px] flex flex-col gap-6">
          {/* Top row: Title + Actions */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <h1 className="font-[family-name:var(--font-newsreader)] text-3xl sm:text-[38px] font-normal tracking-[-0.6px] text-[#4D0011]">
              Notifications
            </h1>

            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C4B56] hover:text-[#4D0011] transition cursor-pointer py-1 px-2 rounded-md hover:bg-[#FAF2EE] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck size={14} className="stroke-[2.2]" />
              <span>Mark all as read</span>
            </button>
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
              <span>All</span>
              {filter === "all" && (
                <span className="size-1.5 rounded-full bg-white ml-0.5" />
              )}
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
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold ${
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

          {/* Notifications List */}
          <div className="flex flex-col gap-8 pt-1">
            {/* NEW Section */}
            {fresh.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold tracking-[0.6px] uppercase text-[#887272]">
                    NEW
                  </span>
                </div>

                <div className="overflow-hidden bg-white rounded-2xl border border-[#F2E9E4] shadow-[0_2px_12px_rgba(77,0,17,0.03)] divide-y divide-[#F2E9E4]">
                  {fresh.map((n) => (
                    <AdminNotificationRow
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
                  <span className="text-xs text-[#887272]">Archived history</span>
                </div>

                <div className="overflow-hidden bg-white rounded-2xl border border-[#F2E9E4] shadow-[0_2px_12px_rgba(0,0,0,0.02)] divide-y divide-[#F2E9E4]">
                  {earlier.map((n) => (
                    <AdminNotificationRow
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
              <div className="py-16 text-center text-sm text-[#887272] bg-white rounded-2xl border border-[#F2E9E4]">
                You&apos;re all caught up. No notifications found.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer matching Image */}
      <footer className="border-t border-[#F2E9E4] bg-white py-8 px-6 sm:px-12 mt-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#554243]">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Link href="/admin">
              <Image
                src="/eventifytxt-cropped.svg"
                alt="Eventify"
                width={100}
                height={28}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <span className="text-[#887272]">
              © 2026 Eventify Campus Inc. All rights reserved. Connecting university life & student culture.
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
  );
}

function AdminNotificationRow({
  n,
  onDismiss,
  onToggleRead,
}: {
  n: AdminNotification;
  onDismiss: (id: string) => void;
  onToggleRead: (id: string) => void;
}) {
  const Icon = n.icon;
  const BadgeIcon = n.badgeIcon;
  const PrimaryIcon = n.actions?.primary?.icon;
  const SecondaryIcon = n.actions?.secondary?.icon;

  return (
    <article className="relative flex items-start gap-4 p-5 sm:p-6 bg-white transition hover:bg-[#FCFBF9]/60">
      {/* Icon circle with badge */}
      <div className="relative shrink-0 mt-0.5">
        <div
          style={{ backgroundColor: n.iconBg, color: n.iconColor }}
          className="flex size-12 items-center justify-center rounded-full"
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        {/* Small corner badge */}
        <div
          style={{
            backgroundColor: n.badgeBg,
            color: n.badgeColor || "#ffffff",
          }}
          className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-white text-[10px] font-bold shadow-2xs"
        >
          <BadgeIcon size={11} strokeWidth={2.4} />
        </div>
      </div>

      {/* Main body */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Title + content */}
        <div className="text-[14.5px] sm:text-[15px] leading-[22px] text-[#1E1B19] pr-10">
          {n.renderTitle()}
        </div>

        {/* Subtext: Time • Meta */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className={n.unread ? "font-medium text-[#8C4B56]" : "text-[#887272]"}>
            {n.time}
          </span>
          <span className="text-[#887272]">•</span>
          <span className="font-semibold uppercase tracking-[0.55px] text-[11px] text-[#887272]">
            {n.meta}
          </span>
        </div>

        {/* Actions row */}
        {n.actions && (n.actions.primary || n.actions.secondary) && (
          <div className="flex items-center gap-2.5 pt-1.5 flex-wrap">
            {n.actions.primary &&
              (n.actions.primary.href ? (
                <Link
                  href={n.actions.primary.href}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer ${n.actions.primary.bg}`}
                >
                  {PrimaryIcon && <PrimaryIcon size={12} />}
                  <span>{n.actions.primary.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleRead(n.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer ${n.actions.primary.bg}`}
                >
                  {PrimaryIcon && <PrimaryIcon size={12} />}
                  <span>{n.actions.primary.label}</span>
                </button>
              ))}

            {n.actions.secondary &&
              (n.actions.secondary.href ? (
                <Link
                  href={n.actions.secondary.href}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer ${n.actions.secondary.bg}`}
                >
                  {SecondaryIcon && <SecondaryIcon size={12} />}
                  <span>{n.actions.secondary.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer ${n.actions.secondary.bg}`}
                >
                  {SecondaryIcon && <SecondaryIcon size={12} />}
                  <span>{n.actions.secondary.label}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Trailing: Unread dot + options button */}
      <div className="absolute top-5 right-5 flex items-center gap-3 shrink-0">
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
          aria-label="Options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </article>
  );
}
