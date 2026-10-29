import Link from "next/link";
import {
  BellIcon,
  CalendarIcon,
  ChevronDownIcon,
  SearchIcon,
  UserIcon,
  UsersIcon,
} from "./icons";

const iconBtn =
  "relative flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";

export default function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#EAE4E1] bg-white/95 px-4 py-2.5 backdrop-blur-[6px]">
      <div className="mx-auto flex h-[44px] max-w-[1280px] items-center justify-between gap-4 lg:gap-[177px] lg:justify-start">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <img
            src="/eventifytxt-cropped.svg"
            alt="Eventify"
            className="h-9  w-auto object-contain transition transform group-hover:scale-105"
          />
        </Link>
        {/* Compact search with GO button */}
        <form
          role="search"
          action="/events"
          className="relative hidden h-[30px] w-full max-w-[320px] md:block"
        >
          <SearchIcon className="pointer-events-none absolute left-2.5 top-[9px] h-3 w-3 text-neutral-400" />
          <input
            type="search"
            name="q"
            placeholder="Search campus..."
            className="h-[30px] w-full rounded-full border-0 bg-[#F5F2F0] py-[6px] pl-7 pr-11 text-xs text-neutral-800 placeholder:text-neutral-400 focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            className="absolute right-1 top-[5.5px] flex h-[19px] items-center justify-center rounded-full bg-brand px-2 text-[10px] font-bold uppercase tracking-[0.5px] text-white"
          >
            Go
          </button>
        </form>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <Link
            href="/organizer-dashboard"
            className="hidden items-center gap-1.5 rounded-full bg-[#ffd9dd] px-3 py-1 text-xs font-semibold text-[#70343f] transition hover:bg-[#fdabb7] sm:flex"
          >
            <span className="size-1.5 rounded-full bg-[#4d0011]" />
            Organizer Mode
          </Link>
          <button
            type="button"
            className="hidden h-6 items-center gap-1 rounded-lg bg-neutral-100/80 px-2.5 text-xs font-semibold text-neutral-700 sm:flex"
          >
            Departments
            <ChevronDownIcon className="h-2 w-2 text-neutral-400" />
          </button>
          <button type="button" className={iconBtn} aria-label="View monthly calendar">
            <CalendarIcon className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={iconBtn} aria-label="View notifications">
            <BellIcon className="h-3.5 w-3.5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-brand"
            aria-label="Student account menu"
          >
            <UserIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
    </header>
  );
}