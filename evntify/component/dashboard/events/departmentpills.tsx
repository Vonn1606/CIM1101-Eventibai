import Link from "next/link";
import { DEPARTMENTS, type DepartmentId } from "@/lib/department";

export default function DepartmentPills({
    active,
    hrefFor,
}: {
    active: DepartmentId | "all";
    hrefFor: (dept: DepartmentId | "all") => string;
}) {
    const items = [{ value: "all" as const, short: "All Colleges" }, ...DEPARTMENTS];

    return (
        <nav aria-label="Filter by college" className="flex flex-wrap items-center gap-2 pt-3">
            <span className="pr-1 text-[11px] font-bold uppercase tracking-[0.55px] text-[#D9DADC]">
                Filter by
            </span>
            {items.map((d) => {
                const isActive = d.value === active;
                return (
                    <Link
                        key={d.value}
                        href={hrefFor(d.value)}
                        aria-current={isActive ? "page" : undefined}
                        className={
                            isActive
                                ? "flex items-center gap-1.5 rounded-full bg-forest px-4 py-1.5 text-[11px] font-bold tracking-[0.44px] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
                                : "rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.44px] text-[#D9DADC] transition hover:bg-white/10"
                        }
                    >
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-mint" />}
                        {d.short}
                    </Link>
                );
            })}
        </nav>
    );
}
