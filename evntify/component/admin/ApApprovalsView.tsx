"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Search,
  SlidersHorizontal,
  ScrollText,
  ExternalLink,
  Timer,
  TrendingUp,
  ClipboardList,
  Undo2,
  CheckCircle2,
  Ban,
} from "lucide-react";
import type { ApprovalItem } from "@/lib/db/stats";
import type { Proposal, Decision } from "@/types/admin";
import ApProposalCard from "./ApProposalCard";
import ApReviewModal from "./ApReviewModal";
import { decideApproval } from "@/app/actions/approvals";

type Tab = "pending" | "returned" | "approved" | "declined";

const C = 2 * Math.PI * 19.67;

/** Map an ApprovalItem (DB) to the Proposal shape the UI components expect */
function mapToProposal(a: ApprovalItem): Proposal {
  const isApproved = a.decision === "approved";
  const isDeclined = a.decision === "declined" || a.decision === "rejected";
  const isReturned = a.decision === "returned";

  const tone = isApproved ? "green" : isDeclined ? "red" : isReturned ? "amber" : "blue";
  return {
    id: a.id,
    dept: a.dept,
    tone,
    submitted: a.submittedAt
      ? new Date(a.submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      : "Recently",
    stage: isApproved
      ? "Approved"
      : isDeclined
        ? "Declined"
        : isReturned
          ? "Returned"
          : "Awaiting Review",
    stageTone: isApproved ? "green" : isDeclined ? "red" : "amber",
    title: a.eventTitle,
    org: a.org,
    when: a.when,
    date: a.date,
    venue: a.venue,
    venueNote: a.venueNote,
    attendance: `${a.seatsExpected || a.seatsTotal} expected attendees`,
    docs: a.documents && a.documents.length > 0 ? `${a.documents.length} attached` : "—",
    check: a.safetyCheck,
    checkTone: a.safetyCheck.toLowerCase().includes("passed") || a.safetyCheck.toLowerCase().includes("verif")
      ? "green"
      : a.safetyCheck === "Not recorded"
      ? "blue"
      : "amber",
    risk: a.risk || "Standard",
    seatsTotal: a.seatsTotal || 100,
    seatsExpected: a.seatsExpected || a.seatsTotal || 100,
    capacityNote: a.capacityNote,
    brief: a.brief,
    endorsements: a.endorsements ?? [],
    submittedBy: `Submitted by ${a.submittedBy}`,
    updated: a.decidedAt
      ? `Decided ${new Date(a.decidedAt).toLocaleDateString()}`
      : "",
    banner: "linear-gradient(135deg,#233144,#8B263E)",
    status: isApproved
      ? "approved"
      : isReturned
        ? "returned"
        : isDeclined
          ? "declined"
          : "pending",
    contact: a.submittedBy,
    contactEmail: a.contactEmail,
    clearance: a.safetyCheck,
    clearanceNote: a.safetyCheck === "Not recorded" ? "Pending inspection" : "Verified by campus administration",
    documents: a.documents ?? [],
  };
}

interface ApApprovalsViewProps {
  initialProposals?: ApprovalItem[];
}

export default function ApApprovalsView({
  initialProposals = [],
}: ApApprovalsViewProps) {
  const [items, setItems] = useState<Proposal[]>(
    initialProposals.map(mapToProposal)
  );
  // Keep map from proposal UI-id → DB approval id
  const [approvalIds] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    initialProposals.forEach((a) => m.set(a.id, a.id));
    return m;
  });

  const [tab, setTab] = useState<Tab>("pending");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const count = (s: Decision) => items.filter((i) => i.status === s).length;
  const approvedTotal = count("approved");
  const processedTotal = approvedTotal + count("returned") + count("declined");
  const clearanceRate = processedTotal > 0 ? Math.round((approvedTotal / processedTotal) * 100) : 0;

  // Compute average review time from decided proposals
  const avgReviewDays = useMemo(() => {
    const decided = initialProposals.filter((a) => a.decidedAt && a.submittedAt);
    if (decided.length === 0) return "—";
    const totalMs = decided.reduce((sum, a) => {
      return sum + (new Date(a.decidedAt!).getTime() - new Date(a.submittedAt!).getTime());
    }, 0);
    const avgDays = totalMs / decided.length / (1000 * 60 * 60 * 24);
    return avgDays < 1 ? `${Math.round(avgDays * 24)} hrs` : `${avgDays.toFixed(1)} days`;
  }, [initialProposals]);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => i.status === tab)
      .filter(
        (i) =>
          !q ||
          [i.title, i.org, i.dept, i.venue].some((s) =>
            s.toLowerCase().includes(q)
          )
      );
  }, [items, tab, query]);

  const open = items.find((i) => i.id === openId) ?? null;

  function decide(id: string, d: "approved" | "returned" | "declined", notes?: string) {
    const previous = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: d } : i)));
    setOpenId(null);

    // Fire Server Action for approved/declined/returned
    const approvalId = approvalIds.get(id);
    if (approvalId) {
      startTransition(async () => {
        const res = await decideApproval({
          approvalId,
          decision: d,
          notes,
        });
        if (res.error) {
          // Revert optimistic update on error
          setItems(previous);
          alert(`Failed to save decision: ${res.error}`);
        }
      });
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof ClipboardList }[] = [
    { key: "pending", label: "Pending review", icon: ClipboardList },
    { key: "returned", label: "Returned for edits", icon: Undo2 },
    { key: "approved", label: "Approved recently", icon: CheckCircle2 },
    { key: "declined", label: "Declined", icon: Ban },
  ];

  return (
    <div className="container approvals">
      <section className="ap-head">
        <div className="ap-title">
          <div className="ap-badge-row">
            <span className="chip upper pink">Action required</span>
            <span className="t-12 muted-brown">
              {count("pending")} proposals waiting
            </span>
          </div>
          <h1>Clearance &amp; Compliance Queue</h1>
          <p className="ap-sub">
            Review event proposals against campus safety, venue capacity, and
            institutional guidelines.
          </p>
        </div>

        <div className="ap-kpis">
          <div className="card ap-kpi">
            <div className="ring-box">
              <svg viewBox="0 0 45 45" className="ring">
                <circle cx="22.5" cy="22.5" r="19.67" className="ring-bg" />
                <circle
                  cx="22.5"
                  cy="22.5"
                  r="19.67"
                  className="ring-fg"
                  strokeDasharray={`${(clearanceRate / 100) * C} ${C}`}
                />
              </svg>
              <span className="ring-txt">{clearanceRate}%</span>
            </div>
            <div>
              <div className="label brown">Clearance rate</div>
              <div className="ap-val">{clearanceRate}%</div>
              <div className="t-12 trend-green">
                <TrendingUp size={12} /> {approvedTotal} approved
              </div>
            </div>
          </div>

          <div className="card ap-kpi">
            <div className="kpi-icon" style={{ background: "#DDE9FF", color: "#0050D4", width: 45, height: 48 }}>
              <Timer size={20} />
            </div>
            <div>
              <div className="label brown">Avg review time</div>
              <div className="ap-val">{avgReviewDays}</div>
              <div className="t-12 muted-brown">per proposal</div>
            </div>
          </div>
        </div>
      </section>

      <section className="policy">
        <i className="policy-blob" />
        <div className="policy-main">
          <span className="policy-icon rose">
            <ScrollText size={18} />
          </span>
          <div>
            <div className="policy-title">
              <b>Institutional policy reminder</b>
              <span className="chip" style={{ background: "rgba(184,0,53,.1)", color: "#B80035" }}>
                Mandatory
              </span>
            </div>
            <p>
              Events with high-voltage equipment, off-campus routes or more than
              500 attendees need a safety officer sign-off before a permit can be
              issued. Check each proposal&apos;s endorsements before approving.
            </p>
          </div>
        </div>
        <button type="button" className="white-btn">
          Open policy handbook <ExternalLink size={13} />
        </button>
      </section>

      <section className="ap-filter">
        <div className="ap-tabs" role="tablist">
          {tabs.map(({ key, label, icon: Icon }) => {
            const n = count(key);
            return (
              <button
                key={key} type="button" role="tab"
                aria-selected={tab === key}
                className={tab === key ? "on" : ""}
                onClick={() => setTab(key)}
              >
                <Icon size={13} color={key === "approved" ? "#059669" : undefined} />
                {label}
                {n > 0 && <em>{n}</em>}
              </button>
            );
          })}
        </div>
        <div className="ap-search">
          <div className="field">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search event, club, hall…"
              aria-label="Search proposals"
            />
          </div>
          <button type="button" className="white-btn sm">
            <SlidersHorizontal size={13} /> Filter
          </button>
        </div>
      </section>

      {isPending && (
        <div className="text-xs text-neutral-500 px-4 pb-2">Saving decision…</div>
      )}

      <div className="rv-list">
        {list.length ? (
          list.map((p) => (
            <ApProposalCard
              key={p.id}
              p={p}
              onReview={() => setOpenId(p.id)}
            />
          ))
        ) : (
          <div className="card empty">
            <CheckCircle2 size={20} />
            <p>
              {tab === "pending"
                ? "Nothing left to review. New submissions will appear here."
                : "No proposals in this list yet."}
            </p>
          </div>
        )}
      </div>

      {open && open.status === "pending" && (
        <ApReviewModal
          p={open}
          onClose={() => setOpenId(null)}
          onDecide={decide}
        />
      )}
    </div>
  );
}
