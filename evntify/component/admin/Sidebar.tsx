"use client";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  Users,
  HelpCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  pendingApprovals?: number;
}

export default function Sidebar({ pendingApprovals }: SidebarProps) {
  const pathname = usePathname();

  const nav = [
    { label: "Admin Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Events Directory", icon: CalendarDays, href: "/admin/events-directory" },
    {
      label: "Approval of Events",
      icon: ClipboardCheck,
      href: "/admin/approvals",
      badge:
        pendingApprovals !== undefined
          ? pendingApprovals > 0
            ? pendingApprovals
            : undefined
          : 3,
    },
    { label: "Event & Organizers", icon: Users, href: "/admin/user-and-organizer" },
  ];

  return (
    <aside className="aside">
      <div>
        <div className="brand">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <img
              src="/eventifytxt-cropped.svg"
              alt="Eventify"
              className="h-9 w-auto object-contain transition transform group-hover:scale-105"
            />
          </Link>
          <span className="label brand-sub" style={{ marginLeft: "6px" }}>Admin</span>
        </div>
        <div className="label brand-sub" style={{ padding: "8px 24px 0" }}>Operations Portal</div>
        <nav className="nav">
          {nav.map(({ label, icon: Icon, badge, href }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname
                ? pathname.startsWith(href)
                : false;
            return (
              <Link
                key={label}
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {badge !== undefined && <span className="nav-badge">{badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="help">
        <div className="help-icon"><HelpCircle size={16} /></div>
        <div>
          <div className="t-12-600">Need help?</div>
          <div className="t-12 muted-brown">Contact support</div>
        </div>
      </div>
    </aside>
  );
}
