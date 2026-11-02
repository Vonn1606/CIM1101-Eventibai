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
} from "lucide-react";
import type { ApprovalItem } from "@/lib/db/stats";
import type { Proposal, Decision } from "@/app/data/proposals";
import ApProposalCard from "./ApProposalCard";
import ApProposalInspector from "./ApProposalInspector";
import { decideApproval } from "@/app/actions/approvals";

type Tab = "pending" | "returned" | "approved";

const RATE = 92;
const C = 2 * Math.PI * 19.67;

/** Map an ApprovalItem (DB) to the Proposal shape the UI components expect */
function mapToProposal(a: ApprovalItem): Proposal {
  const tone =
    a.decision === "approved"
      ? "green"
      : a.decision === "rejected"
      ? "red"
      : "blue";
  return {
    id: a.id,
    dept: a.dept,
    tone,
    submitted: new Date(a.submittedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    stage:
      a.decision === "pending" || !a.decision
        ? "Awaiting Review"
        : a.decision === "approved"
        ? "Approved"
        : "Returned",
    stageTone:
      a.decision === "approved"
        ? "green"
        : a.decision === "rejected"
        ? "red"
        : "amber",
    title: a.eventTitle,
    org: a.org,
    when: "",
    date: "",
    venue: a.venue,
    attendance: `${a.seatsTotal} capacity`,
    docs: "—",
    check: "—",
    checkTone: "blue",
    risk: "Standard",
    seatsTotal: a.seatsTotal,
    seatsExpected: a.seatsTotal,
    capacityNote: "",
    brief: `Category: ${a.category || "General"}`,
    endorsements: [],
    submittedBy: `Submitted by ${a.submittedBy}`,
    updated: a.decidedAt
      ? `Decided ${new Date(a.decidedAt).toLocaleDateString()}`
      : "",
    banner: "linear-gradient(135deg,#233144,#8B263E)",
    // Map DB decision → UI status
    status:
      a.decision === "approved"
        ? "approved"
        : a.decision === "rejected"
        ? "returned"
        : "pending",
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
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProposals.find((p) => !p.decision || p.decision === "pending")
      ?.id ?? null
  );
  const [isPending, startTransition] = useTransition();

  const count = (s: Decision) => items.filter((i) => i.status === s).length;
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

  const selected =
    items.find((i) => i.id === selectedId && i.status !== "declined") ?? null;

  function decide(id: string, d: "approved" | "returned" | "declined") {
    const next = items.map((i) => (i.id === id ? { ...i, status: d } : i));
    setItems(next);
    setSelectedId(next.find((i) => i.status === "pending")?.id ?? null);

    // Fire Server Action for approved/declined
    const approvalId = approvalIds.get(id);
    if (approvalId && (d === "approved" || d === "declined")) {
      startTransition(async () => {
        await decideApproval({
          approvalId,
          decision: d === "approved" ? "approved" : "rejected",
        });
      });
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof ClipboardList }[] = [
    { key: "pending", label: "Pending review", icon: ClipboardList },
    { key: "returned", label: "Returned for edits", icon: Undo2 },
    { key: "approved", label: "Approved recently", icon: CheckCircle2 },
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
          <h1>Event Approvals</h1>
          <p>
            Review submitted proposals against institutional policy, then approve,
            return for edits or decline.
          </p>
        </div>
        <div className="ap-kpis">
          <div className="card ap-kpi">
            <div className="ap-ring">
              <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden>
                <circle cx="24" cy="24" r="19.67" fill="none" stroke="#E6EEFF" strokeWidth="4.67" />
                <circle
                  cx="24" cy="24" r="19.67" fill="none"
                  stroke="#E11D48" strokeWidth="4.67"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - RATE / 100)}
                  transform="rotate(-90 24 24)"
                />
              </svg>
              <b>{RATE}%</b>
            </div>
            <div>
              <div className="label brown">Clearance rate</div>
              <div className="ap-val">{RATE}%</div>
              <div className="trend-up"><TrendingUp size={11} /> +2.1% this term</div>
            </div>
          </div>
          <div className="card ap-kpi">
            <div className="kpi-icon" style={{ background: "#DDE9FF", color: "#0050D4", width: 45, height: 48 }}>
              <Timer size={20} />
            </div>
            <div>
              <div className="label brown">Avg review time</div>
              <div className="ap-val">1.8 days</div>
              <div className="t-12 muted-brown">per proposal</div>
            </div>
          </div>
        </div>
      </section>

      <section className="policy">
        <i className="policy-blob" />
        <div className="policy-main">
          <span className="policy-icon"><ScrollText size={18} /></span>
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

      <div className="ap-grid">
        <div className="ap-list">
          {list.length ? (
            list.map((p) => (
              <ApProposalCard
                key={p.id} p={p}
                selected={p.id === selectedId}
                onSelect={() => setSelectedId(p.id)}
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
        <ApProposalInspector
          p={selected}
          onClose={() => setSelectedId(null)}
          onDecide={decide}
        />
      </div>
    </div>
  );
}
