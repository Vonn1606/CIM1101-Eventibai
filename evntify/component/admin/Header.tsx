"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, User, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import ProfileDropdown from "@/component/auth/profile-dropdown";

interface HeaderProps {
  title?: string;
  profile?: { name: string; role: string };
}

export default function Header({ title, profile }: HeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const resolvedTitle =
    title ??
    (() => {
      if (pathname?.startsWith("/admin/events-directory")) return "Events Directory";
      if (pathname?.startsWith("/admin/approvals")) return "Approvals";
      if (pathname?.startsWith("/admin/user-and-organizer")) return "Organizers";
      return "Dashboard";
    })();

  const userProfile = profile ?? {
    name: "Admin Office",
    role: "Student Affairs",
  };

  return (
    <header className="header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="crumbs" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Menu size={18} color="#5C3F40" />
        <span className="t-14-600">{resolvedTitle}</span>
        <span className="t-12 muted-brown">/</span>
        <span className="t-12 muted-brown">Office of Student Affairs</span>
      </div>
      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/admin/notifications" className="icon-btn" aria-label="Notifications">
          <Bell size={18} color="#5C3F40" />
          <span className="dot-badge" />
        </Link>

        {/* Profile button + dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="profile-btn"
            aria-label="Account menu"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <span className="avatar maroon">
              <User size={12} />
            </span>
            <span className="profile-text">
              <b>{userProfile.name}</b>
              <small>{userProfile.role}</small>
            </span>
            <ChevronDown size={10} color="#5C3F40" />
          </button>

          {dropdownOpen && (
            <ProfileDropdown
              name={userProfile.name}
              role={userProfile.role}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
