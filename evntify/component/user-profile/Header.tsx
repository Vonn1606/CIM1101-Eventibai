"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import { createClient } from "@/lib/supabase/client";
import ProfileDropdown from "@/component/auth/profile-dropdown";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
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

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null)
      .then(({ count, error }) => {
        if (!error && typeof count === "number") {
          setHasUnread(count > 0);
        }
      });
  }, [user]);

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link href="/my-events" className="flex items-center gap-2.5 group focus:outline-none shrink-0">
          <Image
            src="/eventifytxt-cropped.svg"
            alt="Eventify"
            width={120}
            height={36}
            className="h-9 w-auto object-contain transition transform group-hover:scale-105"
          />
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/events"
            className="flex items-center rounded-full bg-maroon px-4 py-1.5 text-[12px] font-bold tracking-wide text-white shadow-xs hover:bg-maroon-light transition"
          >
            Explore
          </Link>

          <Link
            href="/notifications"
            className="relative flex size-9 items-center justify-center rounded-xl bg-[#FAF2EE] text-[#554243] transition hover:bg-[#F4ECE8]"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {hasUnread && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[#FDA8B3] ring-2 ring-[#FAF2EE]" />
            )}
          </Link>

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
