"use client";

import { useMemo, useState } from "react";
import {
    Search,
    Users,
    FileClock,
    UserPlus,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    CheckCircle2,
    X,
    Layers,
} from "lucide-react";
<<<<<<< Updated upstream
import type { OrganizerItem } from "@/lib/db/stats";
=======
import {
    COLLEGE_TABS,
    type CollegeFilter,
    type Organizer,
} from "@/app/data/organizer";
>>>>>>> Stashed changes
import OrOrganizerCard from "./OrOrganizerCard";

type Sort = "name" | "pending" | "events";

const PAGE_SIZE = 6;

<<<<<<< Updated upstream
interface OrOrganizersViewProps {
  initialOrganizers?: OrganizerItem[];
}

export default function OrOrganizersView({ initialOrganizers = [] }: OrOrganizersViewProps) {
    const [college, setCollege] = useState("ALL");
=======
interface Props {
  /** Initial organizer list — from DB when available, static fallback otherwise */
  initialOrganizers: Organizer[];
}

export default function OrOrganizersView({ initialOrganizers }: Props) {
    const [college, setCollege] = useState<CollegeFilter>("ALL");
>>>>>>> Stashed changes
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<Sort>("name");
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState<string | null>(null);

<<<<<<< Updated upstream
    const ORGANIZERS = initialOrganizers;

    const totalPending = ORGANIZERS.reduce((n, o) => n + o.pendingProposals, 0);
=======
    const totalPending = initialOrganizers.reduce((n, o) => n + o.pendingProposals, 0);
>>>>>>> Stashed changes

    const collegeTabs = useMemo(() => {
        const unique = Array.from(new Set(ORGANIZERS.map((o) => o.college)));
        return [{ key: "ALL", label: "All Colleges" }, ...unique.map((c) => ({ key: c, label: c }))];
    }, [ORGANIZERS]);

    const counts = useMemo(() => {
<<<<<<< Updated upstream
        const c: Record<string, number> = { ALL: ORGANIZERS.length };
        ORGANIZERS.forEach((o) => { c[o.college] = (c[o.college] ?? 0) + 1; });
        return c;
    }, [ORGANIZERS]);
=======
        const c: Record<CollegeFilter, number> = { ALL: initialOrganizers.length, CAS: 0, CBA: 0, FAAD: 0, COE: 0 };
        initialOrganizers.forEach((o) => (c[o.college] += 1));
        return c;
    }, [initialOrganizers]);
>>>>>>> Stashed changes

    const list = useMemo(() => {
        const q = query.trim().toLowerCase();
        return initialOrganizers.filter((o) => college === "ALL" || o.college === college)
            .filter(
                (o) =>
                    !q ||
                    [o.name, o.org, o.role, o.email, o.college].some((s) => s.toLowerCase().includes(q))
            )
            .sort((a, b) =>
                sort === "pending"
                    ? b.pendingProposals - a.pendingProposals
                    : sort === "events"
                        ? b.activeEvents - a.activeEvents
                        : a.name.localeCompare(b.name)
            );
<<<<<<< Updated upstream
    }, [college, query, sort, ORGANIZERS]);
=======
    }, [college, query, sort, initialOrganizers]);
>>>>>>> Stashed changes

    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const current = Math.min(page, pages);
    const visible = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    function flash(msg: string) {
        setToast(msg);
        window.setTimeout(() => setToast(null), 3500);
    }

    function onMessage(o: OrganizerItem) {
        flash(`Message thread opened with ${o.name} (${o.org}).`);
    }

    const activeLabel = collegeTabs.find((t) => t.key === college)?.label ?? "All Colleges";

    return (
        <div className="or-page">
            <section className="or-hero">
                <div className="or-hero-text">
                    <div className="or-eyebrow">
                        <i />
                        <span>People &amp; Organizations</span>
                    </div>
                    <h1>Event &amp; Organizers</h1>
                    <p>
                        Manage student organizers across colleges, keep in touch with
                        their officers, and follow the proposals each organization has in
                        the approval pipeline.
                    </p>
                </div>
                <div className="or-stats">
                    <div className="or-stat">
                        <span className="or-stat-icon" style={{ background: "#E6EEFF" }}>
                            <Users size={20} color="#B80035" />
                        </span>
                        <div>
                            <div className="label">Total</div>
                            <div className="or-stat-val">
                                <b>{initialOrganizers.length}</b>
                                <span>Organizers</span>
                            </div>
                        </div>
                    </div>
                    <div className="or-stat">
                        <span className="or-stat-icon" style={{ background: "#FFDADA" }}>
                            <FileClock size={20} color="#920028" />
                        </span>
                        <div>
                            <div className="label">Pending</div>
                            <div className="or-stat-val">
                                <b>{totalPending}</b>
                                <span>Proposals</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="or-controls">
                <div className="or-controls-row">
                    <div className="or-search">
                        <Search size={15} />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search student or organizer name…"
                            aria-label="Search organizers"
                        />
                        {query && (
                            <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    <div className="or-quick">
                        <span className="or-quick-info">
                            <ShieldCheck size={14} />
                            Verified by Student Affairs
                        </span>
                        <button
                            type="button"
                            className="or-primary"
                            onClick={() => flash("Invite link copied. Share it with the new organizer.")}
                        >
                            <UserPlus size={15} />
                            Invite Organizer
                        </button>
                    </div>
                </div>

                <div className="or-tabs" role="tablist" aria-label="Filter by college">
                    {collegeTabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={college === t.key}
                            className={college === t.key ? "on" : ""}
                            onClick={() => {
                                setCollege(t.key);
                                setPage(1);
                            }}
                        >
                            {t.key === "ALL" && <Layers size={14} />}
                            {t.label}
                            <em>{counts[t.key] ?? 0}</em>
                        </button>
                    ))}
                </div>
            </section>

            <section className="or-body">
                <div className="or-countbar">
                    <div className="or-count-left">
                        <span className="t-12 muted-brown">Showing results for</span>
                        <span className="or-filter-pill">{activeLabel}</span>
                        <i className="or-dot" />
                        <span className="t-12 muted">{list.length} organizers</span>
                    </div>
                    <label className="or-sort">
                        <span className="label">Sort by</span>
                        <span className="or-select">
                            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort organizers">
                                <option value="name">Name (A to Z)</option>
                                <option value="pending">Most pending proposals</option>
                                <option value="events">Most active events</option>
                            </select>
                            <ChevronDown size={12} />
                        </span>
                    </label>
                </div>

                {visible.length ? (
                    <div className="or-grid">
                        {visible.map((o) => (
                            <OrOrganizerCard
                                key={o.id}
                                organizer={o}
                                showCollege={college === "ALL"}
                                onMessage={onMessage}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="or-empty">
                        <Users size={20} />
                        <p>No organizers match these filters. Clear the search or pick another college.</p>
                    </div>
                )}

                <footer className="or-footer">
                    <div className="or-footer-left">
                        <CheckCircle2 size={14} color="#0050D4" />
                        <span className="t-12 muted">
                            Showing {visible.length ? (current - 1) * PAGE_SIZE + 1 : 0} to{" "}
                            {(current - 1) * PAGE_SIZE + visible.length} of {list.length} organizers. Audit trail is kept for every
                            change.
                        </span>
                    </div>
                    <div className="or-pager">
                        <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                            <ChevronLeft size={12} /> Previous
                        </button>
                        <span className="or-page-no">
                            Page {current} of {pages}
                        </span>
                        <button type="button" disabled={current >= pages} onClick={() => setPage(current + 1)}>
                            Next <ChevronRight size={12} />
                        </button>
                    </div>
                </footer>
            </section>

            {toast && (
                <div className="or-toast" role="status">
                    <CheckCircle2 size={16} />
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
}
