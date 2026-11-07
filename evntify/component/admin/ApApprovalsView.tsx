"use client";

import { useMemo, useState } from "react";
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
import { PROPOSALS, Proposal, Decision } from "@/app/data/proposals";
import ApProposalCard from "./ApProposalCard";
import ApReviewModal from "./ApReviewModal";

type Tab = "pending" | "returned" | "approved";

const RATE = 92;
const C = 2 * Math.PI * 19.67;

export default function ApApprovalsView() {
  const [items, setItems] = useState<Proposal[]>(PROPOSALS);
  const [tab, setTab] = useState<Tab>("pending");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

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

  const open = items.find((i) => i.id === openId) ?? null;

  function decide(id: string, d: "approved" | "returned" | "declined") {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: d } : i)));
    setOpenId(null);
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
            Open a proposal to inspect its details and documents, then approve,
            return for edits or decline.
          </p>
        </div>
        <div className="ap-kpis">
          <div className="card ap-kpi">
            <div className="ap-ring">
              <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden>
                <circle
                  cx="24"
                  cy="24"
                  r="19.67"
                  fill="none"
                  stroke="#E6EEFF"
                  strokeWidth="4.67"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="19.67"
                  fill="none"
                  stroke="#E11D48"
                  strokeWidth="4.67"
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
              <div className="trend-up">
                <TrendingUp size={11} /> +2.1% this term
              </div>
            </div>
          </div>
          <div className="card ap-kpi">
            <div
              className="kpi-icon"
              style={{
                background: "#DDE9FF",
                color: "#0050D4",
                width: 45,
                height: 48,
              }}
            >
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
          <span className="policy-icon rose">
            <ScrollText size={18} />
          </span>
          <div>
            <div className="policy-title">
              <b>Institutional policy reminder</b>
              <span
                className="chip"
                style={{
                  background: "rgba(184,0,53,.1)",
                  color: "#B80035",
                }}
              >
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
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={tab === key ? "on" : ""}
                onClick={() => setTab(key)}
              >
                <Icon
                  size={13}
                  color={key === "approved" ? "#059669" : undefined}
                />
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
