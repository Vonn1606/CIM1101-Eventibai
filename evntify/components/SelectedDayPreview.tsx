import { Clock, MapPin, QrCode, Users } from "lucide-react";

export default function SelectedDayPreview() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-maroon">Selected day</span>
          <h3 className="text-[15px] font-bold">Saturday, October 17, 2026</h3>
        </div>
        <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[10px] font-bold tracking-[0.6px] text-[#007147]">1 event</span>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-surface-low p-3">
        <div className="flex items-center gap-1 text-[10px] font-bold tracking-[0.6px] text-maroon">
          <QrCode className="size-3.5" />Registered
        </div>
        <h4 className="text-[15px] font-bold">The 40th Anniversary Concert: FINALE</h4>
        <ul className="flex flex-col gap-1 text-[11px] text-body">
          <li className="flex items-center gap-1">
            <Clock className="size-3.5 text-muted" />6:00 PM (placeholder)
          </li>
          <li className="flex items-center gap-1">
            <MapPin className="size-3.5 text-muted" />University Auditorium (placeholder)
          </li>
          <li className="flex items-center gap-1">
            <Users className="size-3.5 text-muted" />Open to all students (placeholder)
          </li>
        </ul>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-bold tracking-[0.6px] text-muted">Ticket ready</span>
          <button className="flex items-center gap-1 rounded-lg bg-maroon px-3 py-1.5 text-[10px] font-bold tracking-[0.6px] text-white hover:bg-maroon-light transition">
            <QrCode className="size-2.5" />View pass
          </button>
        </div>
      </div>
    </div>
  );
}

