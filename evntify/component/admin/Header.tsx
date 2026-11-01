import { Menu, Bell, User, ChevronDown } from "lucide-react";

interface HeaderProps {
  title?: string;
  profile?: { name: string; role: string };
}

export default function Header({ title = "Dashboard", profile }: HeaderProps) {
  return (
    <header className="header">
      <div className="crumbs">
        <Menu size={18} color="#5C3F40" />
        <span className="t-14-600">{title}</span>
        <span className="t-12 muted-brown">/</span>
        <span className="t-12 muted-brown">Office of Student Affairs</span>
      </div>
      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} color="#5C3F40" />
          <span className="dot-badge" />
        </button>
        <button className="profile-btn" aria-label="Account">
          <span className={`avatar ${profile ? "maroon" : ""}`}>
            <User size={profile ? 12 : 13} />
          </span>
          {profile && (
            <span className="profile-text">
              <b>{profile.name}</b>
              <small>{profile.role}</small>
            </span>
          )}
          <ChevronDown size={10} color="#5C3F40" />
        </button>
      </div>
    </header>
  );
}
