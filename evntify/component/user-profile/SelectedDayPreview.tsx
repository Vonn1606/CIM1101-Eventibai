import Link from "next/link";
import { Clock, MapPin, QrCode, Sparkles } from "lucide-react";

export interface SelectedDayEventItem {
  date: string;
  title: string;
  time: string;
  venue: string;
  ticketCode?: string;
  isRegistered?: boolean;
  slug?: string;
}

interface SelectedDayPreviewProps {
  event?: SelectedDayEventItem | null;
  events?: SelectedDayEventItem[] | null;
}

export default function SelectedDayPreview({ event, events }: SelectedDayPreviewProps) {
  const eventList = events ?? (event ? [event] : []);

  if (eventList.length === 0) {
    return null;
  }

  const firstEvent = eventList[0];
  const countLabel = `${eventList.length} event${eventList.length > 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-maroon">Selected day</span>
          <h3 className="text-[15px] font-bold">
            {firstEvent.date}
          </h3>
        </div>
        <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[10px] font-bold tracking-[0.6px] text-[#007147]">
          {countLabel}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {eventList.map((ev, idx) => {
          const isRegistered = ev.isRegistered ?? true;
          return (
            <div key={idx} className="flex flex-col gap-2 rounded-xl bg-surface-low p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold tracking-[0.6px]">
                {isRegistered ? (
                  <span className="flex items-center gap-1 text-maroon">
                    <QrCode className="size-3.5" />Registered
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-blue-700">
                    <Sparkles className="size-3.5" />Open for Registration
                  </span>
                )}
              </div>
              <h4 className="text-[15px] font-bold">{ev.title}</h4>
              <ul className="flex flex-col gap-1 text-[11px] text-body">
                <li className="flex items-center gap-1">
                  <Clock className="size-3.5 text-muted" />{ev.time}
                </li>
                <li className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-muted" />{ev.venue}
                </li>
              </ul>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold tracking-[0.6px] text-muted">
                  {isRegistered ? "Ticket ready" : "Campus Event"}
                </span>
                {isRegistered ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-maroon px-3 py-1.5 text-[10px] font-bold tracking-[0.6px] text-white">
                    <QrCode className="size-2.5" />Confirmed
                  </span>
                ) : (
                  <Link
                    href={ev.slug ? `/events/${ev.slug}` : "/events"}
                    className="flex items-center gap-1 rounded-lg bg-[#0050D4] px-3 py-1.5 text-[10px] font-bold tracking-[0.6px] text-white hover:bg-blue-700 transition"
                  >
                    Register
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
