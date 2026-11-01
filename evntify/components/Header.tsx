"use client";

import Link from "next/link";
import { Bell, ChevronDown, Search, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/events?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/events");
    }
  };

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
            className="relative rounded-full p-2 text-body hover:bg-surface-low transition"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-green ring-2 ring-white" />
          </button>
          <Link
            href="/my-events"
            className="flex items-center gap-1 rounded-full p-1 hover:bg-surface-low transition"
            aria-label="Account menu"
          >
            <span className="grid size-8 place-items-center rounded-full bg-maroon text-white font-bold text-xs">
              <User className="size-4" />
            </span>
            <ChevronDown className="size-3 text-muted" />
          </Link>
        </div>
      </div>
    </header>
  );
}

