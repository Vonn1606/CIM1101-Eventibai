import { CalendarCheck, History, Ticket } from "lucide-react";

function Metric({
  icon,
  value,
  label,
  active,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-low px-3 py-2">
      <span
        className={`grid size-8 place-items-center rounded-full ${
          active ? "bg-maroon/10 text-maroon" : "bg-surface-high text-body"
        }`}
      >
        {icon}
      </span>
      <div>
        <p className={`text-[15px] font-bold leading-5 ${active ? "text-maroon" : "text-ink"}`}>{value}</p>
        <p className="text-[10px] font-bold uppercase leading-3 tracking-[0.5px] text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function WelcomeBar({ upcoming, past }: { upcoming: number; past: number }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-14 place-items-center rounded-full bg-maroon text-white shadow-md">
          <Ticket className="size-6" />
        </span>
        <h1 className="pt-1 text-2xl font-bold tracking-[-0.24px]">My Events</h1>
      </div>
      <div className="flex gap-3">
        <Metric active icon={<CalendarCheck className="size-3.5" />} value={upcoming} label="Upcoming" />
        <Metric icon={<History className="size-3.5" />} value={past} label="Past" />
      </div>
    </section>
  );
}

