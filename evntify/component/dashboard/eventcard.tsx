import Link from "next/link";
import type { CampusEvent } from "@/types/events";
import { seatTone } from "@/app/lib/events";
import { PinIcon, UsersIcon } from "./layout-dashboard/icons";

export default function EventCard({ event }: { event: CampusEvent }) {
  const tone = seatTone(event.seatsLeft);

  return (
    <article className="flex h-[264.75px] w-[296px] min-w-[290px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-neutral-200/90 bg-white">
      {/* Banner — swap the bg for an <Image> when you have posters */}
      <div
        className="flex h-28 flex-col justify-between p-3"
        style={{ background: event.bannerColor }}
      >
        <div className="flex justify-end">
          <span
            className="relative inline-flex h-[20.5px] items-center rounded-full bg-white pl-5 pr-2.5 text-[11px] font-bold"
            style={{ color: tone.text }}
          >
            <span
              className="absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
              style={{ background: tone.dot }}
            />
            {event.seatsLeft} Seats Left
          </span>
        </div>
        <p className="text-[30px] font-extrabold italic leading-9 tracking-[-1.5px] text-white/20">
          {event.code}
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div className="flex flex-col gap-[5px]">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-brand">
            <UsersIcon className="h-[11px] w-[11px]" />
            {event.org}
          </div>
          <h3 className="text-sm font-bold leading-[19px] text-neutral-900">
            {event.title}
          </h3>
          <div className="flex items-center gap-1 pt-[3px] text-xs text-neutral-500">
            <PinIcon className="h-[11px] w-2 shrink-0 text-neutral-400" />
            {event.date}
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-3">
          <Link
            href={event.href}
            className="flex h-8 w-full items-center justify-center rounded-lg bg-brand px-3 text-xs font-bold text-white transition hover:bg-[#772840]"
          >
            Register
          </Link>
        </div>
      </div>
    </article>
  );
}
