"use client";

import { useMemo, useState } from "react";
import {
  Search,
  XCircle,
  Zap,
  History,
  ArrowDownUp,
  ChevronDown,
  LayoutGrid,
  List,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { EventDirectoryItem } from "@/lib/db/stats";
import type { EventItem } from "@/types/admin";
import { pct } from "@/types/admin";
import EdEventCard from "./EdEventCard";
import EdInspector from "./EdInspector";

type Tab = "active" | "completed";
type Sort = "soonest" | "booked" | "az";

const COLLEGE_CHIPS = [
  "All Colleges",
  "Engineering",
  "Arts & Science",
  "Business",
  "Design",
] as const;

/** Map DB item → legacy EventItem shape for child components */
function toEventItem(d: EventDirectoryItem): EventItem {
  const statusMap: Record<string, EventItem["status"]> = {
    open: "ongoing",
    draft: "scheduled",
    closed: "completed",
    concluded: "completed",
    suspended: "completed",
  };
  return {
    id: d.slug,
    dept: d.dept,
    title: d.title,
    blurb: d.category,
    status: (statusMap[d.status] ?? "scheduled") as EventItem["status"],
    org: d.org,
    date: d.date,
    venue: d.venue,
    registered: d.registered,
    capacity: d.capacity || 1,
    people: [],
    accent: d.bannerColor,
    banner: `linear-gradient(135deg, ${d.bannerColor}, #1a1a2e)`,
    facilities: ["—", "—", "—", "—"] as [string, string, string, string],
  };
}

interface EdEventsViewProps {
  initialEvents?: EventDirectoryItem[];
  total?: number;
}

export default function EdEventsView({
  initialEvents = [],
  total = 0,
}: EdEventsViewProps) {
  const [tab, setTab] = useState<Tab>("active");
  const [college, setCollege] = useState(COLLEGE_CHIPS[0] as string);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("soonest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<EventItem | null>(null);

  const allMapped = useMemo(() => initialEvents.map(toEventItem), [initialEvents]);

  const counts = {
    active: allMapped.filter((e) => e.status !== "completed").length,
    completed: allMapped.filter((e) => e.status === "completed").length,
  };

  const liveCount = allMapped.filter((e) => e.status === "ongoing").length;
  const approvedCount = allMapped.filter((e) => e.status !== "completed").length;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMapped
      .filter((e) =>
        tab === "completed" ? e.status === "completed" : e.status !== "completed"
      )
      .filter((e) => college === COLLEGE_CHIPS[0] || e.dept.includes(college))
      .filter(
        (e) =>
          !q ||
          [e.title, e.org, e.venue, e.dept].some((s) =>
            s.toLowerCase().includes(q)
          )
      )
      .sort((a, b) =>
        sort === "booked"
          ? pct(b) - pct(a)
          : sort === "az"
          ? a.title.localeCompare(b.title)
          : 0
      );
  }, [allMapped, tab, college, query, sort]);

  return (
    <div className="ed-container">
      {/* Hero */}
      <section className="ed-ev-hero">
        <div>
          <div className="ed-crumb-line">
            <span>Events</span>
            <span>/</span>
            <b>Central repository</b>
          </div>
          <h1>Events Directory</h1>
          <p>
            Supervise, inspect, and moderate sanctioned collegiate gatherings
            across all university colleges.
          </p>
        </div>
        <div className="ed-glance">
          <span>
            <i style={{ background: "#10B981" }} />{liveCount} live
          </span>
          <span>
            <CheckCircle2 size={13} color="#0050D4" />
            {approvedCount} approved
          </span>
          <span className="ed-red-text">
            <AlertTriangle size={13} color="#B80035" />0 flagged
          </span>
        </div>
      </section>

      {/* Toolbar */}
      <section className="ed-toolbar ed-card">
        <div className="ed-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, clubs, venues…"
            aria-label="Search events"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <XCircle size={13} />
            </button>
          )}
        </div>

        <div className="ed-tools">
          <div className="ed-seg">
            <button className={tab === "active" ? "on" : ""} onClick={() => setTab("active")}>
              <Zap size={13} /> Active <em>{counts.active}</em>
            </button>
            <button className={tab === "completed" ? "on" : ""} onClick={() => setTab("completed")}>
              <History size={13} /> Completed <em>{counts.completed}</em>
            </button>
          </div>
          <span className="ed-vr" />
          <div className="ed-select">
            <ArrowDownUp size={13} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort events"
            >
              <option value="soonest">Soonest first</option>
              <option value="booked">Most booked</option>
              <option value="az">A to Z</option>
            </select>
            <ChevronDown size={10} />
          </div>
          <div className="ed-view-switch">
            <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} aria-label="Grid view">
              <LayoutGrid size={14} />
            </button>
            <button className={view === "list" ? "on" : ""} onClick={() => setView("list")} aria-label="List view">
              <List size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* College chips */}
      <div className="ed-chip-bar">
        <span className="ed-label">College</span>
        {COLLEGE_CHIPS.map((d) => (
          <button
            key={d}
            className={`ed-dept-chip ${college === d ? "on" : ""}`}
            onClick={() => setCollege(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Count bar */}
      <div className="ed-count-bar">
        <div>
          <b className="ed-t-12-600">
            Showing {list.length} of {total || allMapped.length} events
          </b>
          <i className="ed-dot4" />
          <span className="ed-t-12 ed-muted">
            Filtered by {college.toLowerCase()}
          </span>
        </div>
        <div className="ed-cap-legend">
          <span><i style={{ background: "#10B981" }} />Under capacity</span>
          <span><i style={{ background: "#F59E0B" }} />Nearly full</span>
          <span><i style={{ background: "#E11D48" }} />At capacity</span>
        </div>
      </div>

      {/* Grid / List */}
      {list.length ? (
        <div className={`ed-ev-grid ${view}`}>
          {list.map((e) => (
            <EdEventCard key={e.id} event={e} onInspect={setSelected} />
          ))}
        </div>
      ) : (
        <div className="ed-empty ed-card">
          <ShieldCheck size={20} />
          <p>
            No events match these filters. Clear the search or pick another college.
          </p>
        </div>
      )}

      {/* Pager */}
      <footer className="ed-pager-bar">
        <span className="ed-t-12 ed-muted">
          Showing 1 to {list.length} of {total || allMapped.length} events
        </span>
        <div className="ed-pages">
          <button disabled aria-label="Previous page">
            <ChevronLeft size={10} />
          </button>
          <button className="on">1</button>
          <button aria-label="Next page">
            <ChevronRight size={10} />
          </button>
        </div>
      </footer>

      <EdInspector event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
