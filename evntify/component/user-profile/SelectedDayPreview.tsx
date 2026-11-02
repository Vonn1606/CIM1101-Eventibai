import { Clock, MapPin, QrCode } from "lucide-react";

interface SelectedDayPreviewProps {
  event?: {
    date: string;
    title: string;
    time: string;
    venue: string;
    ticketCode: string;
  } | null;
}

export default function SelectedDayPreview({ event }: SelectedDayPreviewProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-maroon">Selected day</span>
          <h3 className="text-[15px] font-bold">
            {event ? event.date : "No day selected"}
          </h3>
        </div>
        <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[10px] font-bold tracking-[0.6px] text-[#007147]">
          {event ? "1 event" : "0 events"}
        </span>
      </div>

      {event ? (
        <div className="flex flex-col gap-2 rounded-xl bg-surface-low p-3">
          <div className="flex items-center gap-1 text-[10px] font-bold tracking-[0.6px] text-maroon">
            <QrCode className="size-3.5" />Registered
          </div>
          <h4 className="text-[15px] font-bold">{event.title}</h4>
          <ul className="flex flex-col gap-1 text-[11px] text-body">
            <li className="flex items-center gap-1">
              <Clock className="size-3.5 text-muted" />{event.time}
            </li>
            <li className="flex items-center gap-1">
              <MapPin className="size-3.5 text-muted" />{event.venue}
            </li>
          </ul>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold tracking-[0.6px] text-muted">Ticket ready</span>
            <button className="flex items-center gap-1 rounded-lg bg-maroon px-3 py-1.5 text-[10px] font-bold tracking-[0.6px] text-white hover:bg-maroon-light transition">
              <QrCode className="size-2.5" />View pass
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-low p-5 text-center">
          <p className="text-[12px] text-muted">No events scheduled for this day.</p>
        </div>
      )}
    </div>
  );
}
