"use client";

import React from "react";
import Link from "next/link";
import { Search, ChevronLeft } from "lucide-react";

export default function EventsNavbar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
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
          <Link href="/events" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6c0c28] text-white font-extrabold text-sm">
              E
            </span>
            <span className="font-extrabold text-sm tracking-tight text-[#1a1c1e]">
              Eventify
            </span>
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
          <Link
            href="/events"
            className="hidden sm:inline-flex h-8 items-center px-3 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition"
          >
            My Registrations
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c0c28] text-white text-xs font-bold">
            SC
          </div>
        </div>
      </div>
    </header>
  );
}
