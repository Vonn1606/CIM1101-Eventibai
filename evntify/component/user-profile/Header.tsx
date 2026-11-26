"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/use-auth";
import ProfileDropdown from "@/component/auth/profile-dropdown";
import BrandLink from "@/component/layout/brand-link";
import NotificationBell from "@/component/ui/notification-bell";
import type { UserOrganization } from "@/lib/db/active-org";

interface HeaderProps {
  /** All organizations the user belongs to — passed from the server page. */
  organizations?: UserOrganization[];
  /** The currently active org ID — used to highlight the selected entry. */
  activeOrgId?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Header({ organizations = [], activeOrgId: _activeOrgId }: HeaderProps = {}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, profile } = useAuth();

  /* Derive display name and role label from Supabase user, fallback to student profile */
  const displayName =
    profile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "Student");

  const roleLabel =
    profile?.department
      ? `STUDENT • ${profile.department}`
      : user?.user_metadata?.department
        ? `STUDENT • ${user.user_metadata.department}`
        : "STUDENT";

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
        <BrandLink />

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/events"
            className="flex items-center rounded-full bg-maroon px-4 py-1.5 text-[12px] font-bold tracking-wide text-white shadow-xs hover:bg-maroon-light transition"
          >
            Explore
          </Link>

          <NotificationBell className="rounded-xl bg-[#FAF2EE] text-[#554243] hover:bg-[#F4ECE8]" iconSize={16} />

          {/* Profile avatar + dropdown matching organizer & admin dashboards */}
          <div className="relative">
            <button
              className="flex size-9 items-center justify-center rounded-full bg-[#4D0011] text-white shadow-xs hover:opacity-95 transition cursor-pointer"
              aria-label="Account menu"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <User size={16} strokeWidth={2.2} />
            </button>

            {dropdownOpen && (
              <ProfileDropdown
                name={displayName}
                role={roleLabel}
                onClose={() => setDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
