"use client";
import { useAuth } from "@/lib/use-auth";
import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, User } from "lucide-react";
import ProfileDropdown from "@/component/auth/profile-dropdown";

export default function EventsNavbar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const { user, loading, isOrganizer, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "Alex Dela Cruz");

  const roleLabel =
    isAdmin ? "ADMIN" :
    isOrganizer ? "LITS ORG LEAD" :
    (user?.user_metadata?.department ? `STUDENT • ${user.user_metadata.department}` : "STUDENT • CCSS");

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#EAE4E1] bg-white/95 px-4 py-2.5 backdrop-blur-[6px]">
      <div className="mx-auto flex h-[44px] max-w-[1280px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <span className="h-4 w-px bg-neutral-200" />
          <Link href="/events" className="flex items-center gap-2.5 group focus:outline-none">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6c0c28] text-white font-extrabold text-sm">
              E
            </span>
            <img
              src="/eventifytxt4.svg"
              alt="Eventify"
              className="h-20  w-auto object-contain transition transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, organizers, or topics..."
            className="h-8 w-full rounded-full border border-neutral-200 bg-[#F5F2F0] py-1.5 pl-8 pr-4 text-xs text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6c0c28]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-16 rounded-lg bg-neutral-100 animate-pulse" />
          ) : user ? (
            <>
              <Link
                href={isAdmin ? "/admin" : isOrganizer ? "/organizer-dashboard" : "/my-events"}
                className="hidden sm:inline-flex h-8 items-center px-3 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition"
              >
                {isAdmin ? "Admin Portal" : isOrganizer ? "Organizer Dashboard" : "My Events"}
              </Link>

              {/* Profile avatar button + dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4D0011] text-white transition hover:opacity-95 cursor-pointer"
                  aria-label="Account menu"
                  aria-expanded={dropdownOpen}
                >
                  <User size={15} strokeWidth={2.2} />
                </button>

                {dropdownOpen && (
                  <ProfileDropdown
                    name={displayName}
                    role={roleLabel}
                    onClose={() => setDropdownOpen(false)}
                  />
                )}
              </div>
            </>
          ) : (
            <Link
              href="/signin?next=/events"
              className="inline-flex h-8 items-center rounded-lg bg-[#6c0c28] px-4 text-xs font-bold text-white transition hover:bg-[#8b263e]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
