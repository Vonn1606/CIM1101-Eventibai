import { BadgeCheck, CalendarDays, CalendarPlus, CircleCheck, Clock, MapPin, QrCode, Ticket } from "lucide-react";
import type { PastEvent, UpcomingEvent } from "@/app/actions/registration";

export function UpcomingCard({ e }: { e: UpcomingEvent }) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className={`flex items-center justify-between px-4 py-3 text-white ${e.headerColor}`}>
        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.5px] ${e.featured ? "text-mint" : ""}`}>
          <Ticket className="size-3.5" />
          {e.headerLabel}
        </span>
        {e.featured && (
          <span className="flex items-center gap-1.5 rounded-full bg-maroon px-2.5 py-1 text-[10px] font-bold tracking-[0.6px] shadow-sm">
            <i className="size-2 rounded-full bg-mint" />
            Registered
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="flex items-center gap-1 text-[11px] font-bold tracking-[0.44px] text-maroon">
              <CalendarDays className="size-3" />
              {e.date}
            </p>
            <h3 className="mt-[3px] text-lg font-bold leading-[25px]">{e.title}</h3>
            <p className="mt-[3px] text-[11px] leading-4 text-body">{e.description}</p>
          </div>
          <div className="flex h-[98px] w-[84px] shrink-0 flex-col items-center rounded-xl bg-surface-low p-2">
            <div className="grid size-16 place-items-center rounded-lg bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <QrCode className="size-9" />
            </div>
            <span className="pt-1 font-mono text-[9px] text-muted">{e.qrCode}</span>
          </div>
        </div>
        <div className="-mx-5 flex flex-wrap gap-x-5 gap-y-2 bg-surface-low/60 px-5 pb-2 pt-1 text-[11px] text-body">
          <span className="flex items-center gap-1">
            <MapPin className="size-3 text-muted" />
            {e.venue}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3 text-muted" />
            {e.meta}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex gap-2">
            <button className="flex items-center gap-1 rounded-lg bg-maroon px-3 py-2 text-[11px] font-bold tracking-[0.44px] text-white hover:bg-maroon-light transition">
              <QrCode className="size-3" />
              View ticket
            </button>
            <button className="flex items-center gap-1 rounded-lg bg-surface-high px-3 py-2 text-[11px] font-bold tracking-[0.44px] text-body hover:bg-surface-highest transition">
              <CalendarPlus className="size-3" />
              Add to calendar
            </button>
          </div>
          <button className="text-[10px] font-bold tracking-[0.6px] text-danger hover:underline">
            Cancel registration
          </button>
        </div>
      </div>
    </article>
  );
}

export function PastCard({ e }: { e: PastEvent }) {
  const attended = e.status === "attended";
  return (
    <article className="overflow-hidden rounded-xl bg-surface-low opacity-90">
      <div className="flex items-center justify-between bg-surface-highest px-4 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.5px] text-muted">
          <CircleCheck className="size-3.5" />
          Concluded
        </span>
        {!attended && (
          <span className="flex items-center gap-1 rounded-full bg-surface-mid px-2.5 py-0.5 text-[10px] font-bold tracking-[0.6px] text-muted">
            <i className="size-2 rounded-full bg-muted" />
            Event ended
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="flex items-center gap-1 text-[11px] font-bold tracking-[0.44px] text-muted line-through">
              <CalendarDays className="size-3" />
              {e.date}
            </p>
            <h3 className="mt-[3px] text-lg font-bold leading-[25px] text-muted">{e.title}</h3>
            <p className="mt-[3px] text-[11px] leading-4 text-muted">{e.description}</p>
          </div>
          {attended && (
            <div className="flex h-[63px] shrink-0 flex-col items-center rounded-xl bg-surface-highest/60 p-2 text-green">
              <BadgeCheck className="size-7" />
              <span className="pt-1 text-[10px] font-bold">Verified</span>
            </div>
          )}
        </div>
        <div className="-mx-5 flex flex-wrap gap-5 bg-surface-high/40 px-5 pb-2 pt-1 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {e.venue}
          </span>
          {attended && (
            <span className="flex items-center gap-1 font-bold text-green">
              <BadgeCheck className="size-3.5" />
              {e.meta}
            </span>
          )}
        </div>
        <p className="pt-1 text-right text-[10px] font-bold tracking-[0.6px] text-muted">{e.footer}</p>
      </div>
    </article>
  );
}

