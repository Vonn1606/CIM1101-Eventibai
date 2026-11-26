"use client";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  Users,
  HelpCircle,
  ArrowLeftRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import BrandLink from "@/component/layout/brand-link";

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
          <BrandLink />
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
      <div className="flex flex-col gap-2">
        <Link
          href="/my-events"
          className="nav-link"
          style={{ margin: "0 12px" }}
        >
          <ArrowLeftRight size={16} />
          <span>Switch to Student View</span>
        </Link>
        <div className="help">
          <div className="help-icon"><HelpCircle size={16} /></div>
          <div>
            <div className="t-12-600">Need help?</div>
            <div className="t-12 muted-brown">Contact support</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
