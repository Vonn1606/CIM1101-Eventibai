"use client";

import Link from "next/link";
import { Bell, ChevronDown, Search, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import ProfileDropdown from "@/component/auth/profile-dropdown";

export default function Header() {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/events?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/events");
    }
  };

  /* Derive display name and role label from Supabase user, fallback to student profile */
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "Alex Dela Cruz");

  const roleLabel =
    user?.user_metadata?.department
      ? `STUDENT • ${user.user_metadata.department}`
      : "STUDENT • CCSS";

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-6 px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none shrink-0">
          <img
            src="/eventifytxt-cropped.svg"
            alt="Eventify"
            className="h-9 w-auto object-contain transition transform group-hover:scale-105"
          />
        </Link>

        <form onSubmit={handleSearch} className="flex-1 px-3" role="search">
          <div className="mx-auto flex max-w-md items-center rounded-full bg-surface-low px-2 py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <Search className="mx-2 size-3.5 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent px-1 py-1 text-[13px] outline-none placeholder:text-muted"
              placeholder="Search campus events, venues, clubs..."
            />
            <button
              type="submit"
              className="rounded-full bg-maroon px-3 py-1 text-[11px] font-bold tracking-wide text-white hover:bg-maroon-light transition"
            >
              Go
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/events"
            className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold text-body hover:text-maroon transition"
          >
            Explore <ChevronDown className="size-3" />
          </Link>

          <button
            className="relative flex size-9 items-center justify-center rounded-xl bg-[#FAF2EE] text-[#554243] transition hover:bg-[#F4ECE8]"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#FDA8B3] ring-2 ring-[#FAF2EE]" />
          </button>

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
