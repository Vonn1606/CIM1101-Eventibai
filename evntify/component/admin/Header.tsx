import { Menu, Bell, User, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="header">
      <div className="crumbs">
        <Menu size={18} color="#5C3F40" />
        <span className="t-14-600">Dashboard</span>
        <span className="t-12 muted-brown">/</span>
        <span className="t-12 muted-brown">Office of Student Affairs</span>
      </div>
      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} color="#5C3F40" />
          <span className="dot-badge" />
        </button>
        <button className="profile-btn" aria-label="Account">
          <span className="avatar"><User size={13} /></span>
          <ChevronDown size={10} color="#565E74" />
        </button>
      </div>
    </header>
  );
}
