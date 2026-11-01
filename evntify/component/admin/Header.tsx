"use client";
import { Menu, Bell, User, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  title?: string;
  profile?: { name: string; role: string };
}

export default function Header({ title, profile }: HeaderProps) {
  const pathname = usePathname();

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
    <header className="header">
      <div className="crumbs">
        <Menu size={18} color="#5C3F40" />
        <span className="t-14-600">{resolvedTitle}</span>
        <span className="t-12 muted-brown">/</span>
        <span className="t-12 muted-brown">Office of Student Affairs</span>
      </div>
      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} color="#5C3F40" />
          <span className="dot-badge" />
        </button>
        <button className="profile-btn" aria-label="Account">
          <span className="avatar maroon">
            <User size={12} />
          </span>
          <span className="profile-text">
            <b>{userProfile.name}</b>
            <small>{userProfile.role}</small>
          </span>
          <ChevronDown size={10} color="#5C3F40" />
        </button>
      </div>
    </header>
  );
}
