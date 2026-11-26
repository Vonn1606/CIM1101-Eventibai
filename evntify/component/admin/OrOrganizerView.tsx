"use client";

import { useMemo, useState } from "react";
import {
    Search,
    Users,
    FileClock,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    X,
    Layers,
    PlusCircle,
} from "lucide-react";
import type { OrganizerItem, OrganizationSummary } from "@/lib/db/stats";
import { DEPARTMENTS } from "@/lib/department";
import OrOrganizerCard from "./OrOrganizerCard";
import {
    createOrganizationWithOrganizer,
    decideOrganizerApplication,
    toggleOrganizationSuspension,
} from "@/app/actions/organizer-application";

type Sort = "name" | "pending" | "events";

const PAGE_SIZE = 6;

export interface ApplicationItem {
    id: string;
    userId: string;
    applicantName: string;
    applicantEmail: string;
    studentNumber: string;
    orgName: string;
    position: string;
    department: string;
    reason: string;
    status: string;
    createdAt: string;
}

interface OrOrganizersViewProps {
    initialOrganizers?: OrganizerItem[];
    initialOrganizations?: OrganizationSummary[];
    initialApplications?: ApplicationItem[];
}

export default function OrOrganizersView({
    initialOrganizers = [],
    initialOrganizations = [],
    initialApplications = [],
}: OrOrganizersViewProps) {
    const [college, setCollege] = useState("ALL");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<Sort>("name");
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState<string | null>(null);

    // Modal state for adding new organization & organizer
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [newStudentIdentifier, setNewStudentIdentifier] = useState("");
    const [newPosition, setNewPosition] = useState("Lead Organizer");
    const [creatingOrg, setCreatingOrg] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Applications state
    const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
    const [appFilter, setAppFilter] = useState<"pending" | "all">("pending");
    const [decidingId, setDecidingId] = useState<string | null>(null);

    // Organizations directory state (A1)
    const [organizations, setOrganizations] = useState<OrganizationSummary[]>(initialOrganizations);
    const [orgQuery, setOrgQuery] = useState("");
    const [orgCollege, setOrgCollege] = useState("ALL");
    const [togglingOrgId, setTogglingOrgId] = useState<string | null>(null);

    const filteredOrgs = useMemo(() => {
        const q = orgQuery.trim().toLowerCase();
        return organizations.filter((o) => {
            const matchesCollege = orgCollege === "ALL" || o.collegeSlug === orgCollege;
            const matchesQuery =
                !q ||
                o.name.toLowerCase().includes(q) ||
                o.shortName.toLowerCase().includes(q) ||
                o.leadOrganizer.toLowerCase().includes(q) ||
                o.college.toLowerCase().includes(q);
            return matchesCollege && matchesQuery;
        });
    }, [organizations, orgQuery, orgCollege]);

    async function handleToggleSuspend(org: OrganizationSummary) {
        setTogglingOrgId(org.id);
        const nextSuspended = !org.isSuspended;
        const res = await toggleOrganizationSuspension(org.id, nextSuspended);
        setTogglingOrgId(null);
        if (res.error) {
            flash(res.error);
            return;
        }
        setOrganizations((prev) =>
            prev.map((item) =>
                item.id === org.id
                    ? {
                          ...item,
                          isSuspended: nextSuspended,
                          isActive: item.memberCount > 0 && !nextSuspended,
                      }
                    : item
            )
        );
        flash(
            nextSuspended
                ? `${org.name} has been suspended.`
                : `${org.name} has been reactivated.`
        );
    }

    const ORGANIZERS = initialOrganizers;

    const totalPending = ORGANIZERS.reduce((n, o) => n + o.pendingProposals, 0);

    const collegeTabs = useMemo(() => {
        const unique = Array.from(new Set(ORGANIZERS.map((o) => o.college)));
        return [{ key: "ALL", label: "All Colleges" }, ...unique.map((c) => ({ key: c, label: c }))];
    }, [ORGANIZERS]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { ALL: ORGANIZERS.length };
        ORGANIZERS.forEach((o) => { c[o.college] = (c[o.college] ?? 0) + 1; });
        return c;
    }, [ORGANIZERS]);

    const list = useMemo(() => {
        const q = query.trim().toLowerCase();
        return ORGANIZERS.filter((o) => college === "ALL" || o.college === college)
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
    }, [college, query, sort, ORGANIZERS]);

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

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        setCreatingOrg(true);
        const res = await createOrganizationWithOrganizer({
            orgName: newOrgName,
            studentEmailOrNumber: newStudentIdentifier,
            position: newPosition,
        });
        setCreatingOrg(false);

        if (res.error) {
            setModalError(res.error);
        } else {
            flash(`✓ Organization "${newOrgName}" created and assigned to ${res.studentName || "student"}!`);
            setAddModalOpen(false);
            setNewOrgName("");
            setNewStudentIdentifier("");
        }
    };

    const handleApplicationDecision = async (id: string, decision: "approved" | "rejected") => {
        setDecidingId(id);
        const res = await decideOrganizerApplication(id, decision);
        setDecidingId(null);

        if (res.error) {
            flash(`Failed to update application: ${res.error}`);
        } else {
            setApplications((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: decision } : a))
            );
            flash(`Application marked as ${decision}.`);
        }
    };

    const pendingApps = applications.filter((a) => a.status === "pending");
    const displayedApps = appFilter === "pending" ? pendingApps : applications;

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
                                <b>{ORGANIZERS.length}</b>
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
                        <button
                            type="button"
                            className="or-primary"
                            onClick={() => setAddModalOpen(true)}
                        >
                            <PlusCircle size={15} />
                            Add Organization / Organizer
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

            {/* Pending Applications Section */}
            <section className="or-applications ed-card" style={{ padding: "24px", background: "#fff", borderRadius: "12px", border: "1px solid #ECE5DF", marginTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1E1B19" }}>
                                Organizer Applications from Students
                            </h2>
                            {pendingApps.length > 0 && (
                                <span style={{ background: "#FCECEF", color: "#8C233C", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "9999px" }}>
                                    {pendingApps.length} pending
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: "12px", color: "#7A6B68", marginTop: "2px" }}>
                            Review student requests to establish organizations or be assigned as campus organizers.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="button"
                            onClick={() => setAppFilter("pending")}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: appFilter === "pending" ? "#651C32" : "#FAF5F2",
                                color: appFilter === "pending" ? "#fff" : "#7A6B68",
                                border: "1px solid #ECE2DC",
                                cursor: "pointer",
                            }}
                        >
                            Pending Only ({pendingApps.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setAppFilter("all")}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: appFilter === "all" ? "#651C32" : "#FAF5F2",
                                color: appFilter === "all" ? "#fff" : "#7A6B68",
                                border: "1px solid #ECE2DC",
                                cursor: "pointer",
                            }}
                        >
                            All ({applications.length})
                        </button>
                    </div>
                </div>

                {displayedApps.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {displayedApps.map((app) => (
                            <div
                                key={app.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    padding: "16px",
                                    borderRadius: "10px",
                                    background: "#FAF5F2",
                                    border: "1px solid #ECE2DC",
                                    gap: "16px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <div style={{ flex: "1 1 300px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <b style={{ fontSize: "14px", color: "#1E1B19" }}>{app.applicantName}</b>
                                        <span style={{ fontSize: "11px", color: "#7A6B68" }}>
                                            ({app.applicantEmail} · {app.studentNumber})
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                fontWeight: "700",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                textTransform: "uppercase",
                                                background:
                                                    app.status === "approved"
                                                        ? "#D1FAE5"
                                                        : app.status === "rejected"
                                                            ? "#FEE2E2"
                                                            : "#FEF3C7",
                                                color:
                                                    app.status === "approved"
                                                        ? "#065F46"
                                                        : app.status === "rejected"
                                                            ? "#991B1B"
                                                            : "#92400E",
                                            }}
                                        >
                                            {app.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#651C32", marginTop: "4px" }}>
                                        {app.orgName} — <span style={{ color: "#1E1B19", fontWeight: "500" }}>{app.position}</span>
                                        {app.department && <span style={{ color: "#7A6B68", fontWeight: "400" }}> ({app.department})</span>}
                                    </p>
                                    <p style={{ fontSize: "12px", color: "#554243", marginTop: "6px", fontStyle: "italic" }}>
                                        &ldquo;{app.reason}&rdquo;
                                    </p>
                                    <span style={{ fontSize: "11px", color: "#8A7B78", marginTop: "4px", display: "inline-block" }}>
                                        Submitted on {app.createdAt}
                                    </span>
                                </div>

                                {app.status === "pending" && (
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                                        <button
                                            type="button"
                                            disabled={decidingId === app.id}
                                            onClick={() => handleApplicationDecision(app.id, "rejected")}
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: "8px",
                                                border: "1px solid #BA1A1A",
                                                color: "#BA1A1A",
                                                background: "#fff",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            type="button"
                                            disabled={decidingId === app.id}
                                            onClick={() => handleApplicationDecision(app.id, "approved")}
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "8px",
                                                background: "#0E6245",
                                                color: "#fff",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                border: "none",
                                                cursor: "pointer",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            {decidingId === app.id ? "Processing..." : "Approve & Promote"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "24px", color: "#7A6B68", fontSize: "13px" }}>
                        {appFilter === "pending"
                            ? "No pending student organizer applications."
                            : "No organizer applications recorded."}
                    </div>
                )}
            </section>

            {/* Modal: Add New Organization / Organizer */}
            {addModalOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: "16px", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
                    <div style={{ position: "relative", width: "100%", maxWidth: "480px", borderRadius: "16px", background: "#fff", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #ECE2DC" }}>
                        <button
                            type="button"
                            onClick={() => setAddModalOpen(false)}
                            style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#7A6B68" }}
                        >
                            <X size={18} />
                        </button>

                        <form onSubmit={handleCreateOrg} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#651C32" }}>
                                    Add New Organization &amp; Organizer
                                </h3>
                                <p style={{ fontSize: "12px", color: "#7A6B68", marginTop: "4px" }}>
                                    Create a new recognized campus organization and immediately assign an active student as its leader.
                                </p>
                            </div>

                            {modalError && (
                                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#FEE2E2", color: "#991B1B", fontSize: "12px", border: "1px solid #FCA5A5" }}>
                                    {modalError}
                                </div>
                            )}

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", fontWeight: "600", color: "#1E1B19" }}>
                                    Organization Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Google Developer Student Clubs"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ECE2DC", fontSize: "13px", background: "#FAF5F2" }}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", fontWeight: "600", color: "#1E1B19" }}>
                                    Assigned Student (Email or Student Number) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 20241234567 or student@ue.edu.ph"
                                    value={newStudentIdentifier}
                                    onChange={(e) => setNewStudentIdentifier(e.target.value)}
                                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ECE2DC", fontSize: "13px", background: "#FAF5F2" }}
                                />
                                <small style={{ fontSize: "11px", color: "#7A6B68" }}>
                                    The student will automatically receive organizer permissions.
                                </small>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", fontWeight: "600", color: "#1E1B19" }}>
                                    Position Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. President / Lead Organizer"
                                    value={newPosition}
                                    onChange={(e) => setNewPosition(e.target.value)}
                                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ECE2DC", fontSize: "13px", background: "#FAF5F2" }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                                <button
                                    type="button"
                                    onClick={() => setAddModalOpen(false)}
                                    style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #ECE2DC", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#7A6B68", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingOrg}
                                    style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#651C32", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                                >
                                    {creatingOrg ? "Creating..." : "Save & Assign"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

            {/* Organizations Section (A1) */}
            <section
                className="ed-card"
                style={{
                    padding: "24px",
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #ECE5DF",
                    marginTop: "24px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginBottom: "16px",
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1E1B19" }}>
                            Organizations
                        </h2>
                        <p style={{ fontSize: "12px", color: "#7A6B68", marginTop: "2px" }}>
                            Active campus organizations, member counts, upcoming approved events, and suspension status.
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <div className="or-search" style={{ minWidth: "220px" }}>
                            <Search size={14} />
                            <input
                                value={orgQuery}
                                onChange={(e) => setOrgQuery(e.target.value)}
                                placeholder="Search organizations…"
                                aria-label="Search organizations"
                            />
                            {orgQuery && (
                                <button type="button" aria-label="Clear organization search" onClick={() => setOrgQuery("")}>
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        <select
                            value={orgCollege}
                            onChange={(e) => setOrgCollege(e.target.value)}
                            aria-label="Filter organizations by college"
                            style={{
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #ECE2DC",
                                background: "#FAF5F2",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#1E1B19",
                            }}
                        >
                            <option value="ALL">All Colleges</option>
                            {DEPARTMENTS.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.short}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredOrgs.length > 0 ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "14px",
                        }}
                    >
                        {filteredOrgs.map((org) => (
                            <div
                                key={org.id}
                                style={{
                                    border: "1px solid #ECE2DC",
                                    borderRadius: "12px",
                                    padding: "16px",
                                    background: org.isSuspended ? "#FFF5F5" : "#FAF5F2",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                    <div>
                                        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1E1B19" }}>
                                            {org.name}
                                        </h3>
                                        <p style={{ fontSize: "11px", color: "#7A6B68", marginTop: "2px" }}>
                                            {org.college}
                                        </p>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: "700",
                                            padding: "3px 8px",
                                            borderRadius: "9999px",
                                            background: org.isSuspended
                                                ? "#FEE2E2"
                                                : org.isActive
                                                    ? "#DCFCE7"
                                                    : "#F3F4F6",
                                            color: org.isSuspended
                                                ? "#991B1B"
                                                : org.isActive
                                                    ? "#166534"
                                                    : "#4B5563",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {org.isSuspended ? "Suspended" : org.isActive ? "Active" : "No Members"}
                                    </span>
                                </div>

                                <div style={{ fontSize: "12px", color: "#554243", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    <div>
                                        <span style={{ color: "#8A7B78", fontSize: "11px", display: "block" }}>Lead Organizer</span>
                                        <strong>{org.leadOrganizer}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: "#8A7B78", fontSize: "11px", display: "block" }}>Members</span>
                                        <strong>{org.memberCount}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: "#8A7B78", fontSize: "11px", display: "block" }}>Upcoming Events</span>
                                        <strong>{org.upcomingEvents}</strong>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
                                    <button
                                        type="button"
                                        disabled={togglingOrgId === org.id}
                                        onClick={() => void handleToggleSuspend(org)}
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            padding: "6px 10px",
                                            borderRadius: "8px",
                                            border: "1px solid #ECE2DC",
                                            background: "#fff",
                                            color: org.isSuspended ? "#166534" : "#991B1B",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {togglingOrgId === org.id
                                            ? "Updating…"
                                            : org.isSuspended
                                                ? "Reactivate"
                                                : "Suspend"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="or-empty">
                        <Users size={20} />
                        <p>No organizations match these filters. Clear the search or pick another college.</p>
                    </div>
                )}
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
