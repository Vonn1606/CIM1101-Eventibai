"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, User } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import ProfileDropdown from "@/component/auth/profile-dropdown";

export default function CreateEventTopbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Organizer";

  return (
    <header className="ce-topbar">
      <div className="ce-topbar-left">
        <CalendarDays size={18} color="#554243" />
        <span className="ce-topbar-title">Organizer Portal</span>
        <span className="ce-topbar-sep">|</span>
        <span className="ce-topbar-pill">Society Admin</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/organizer-dashboard" className="ce-back-link">
          ← Back to Dashboard
        </Link>

        {/* Profile avatar + dropdown */}
        <div style={{ position: "relative" }}>
          <button
            aria-label="Account menu"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: "grid",
              placeItems: "center",
              width: 32,
              height: 32,
              borderRadius: "9999px",
              background: "#651C32",
              border: 0,
              cursor: "pointer",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <User size={14} color="#fff" />
          </button>

          {dropdownOpen && (
            <ProfileDropdown
              name={displayName}
              role="Organizer"
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}

