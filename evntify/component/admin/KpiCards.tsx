import { GraduationCap, Building, CalendarCheck, LayoutGrid, TrendingUp, Clock } from "lucide-react";
import type { AdminStats } from "@/lib/db/stats";

interface KpiCardsProps {
  stats?: AdminStats;
}

export default function KpiCards({ stats }: KpiCardsProps) {
  const s = stats ?? {
    totalStudents: 0,
    totalOrganizations: 0,
    scheduledEvents: 0,
    pendingApprovals: 0,
  };

  return (
    <section className="kpis">
      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Total Students</div>
            <div className="kpi-value">{s.totalStudents.toLocaleString()}</div>
          </div>
          <div className="kpi-icon" style={{ background: "#E6EEFF", color: "#8B263E" }}>
            <GraduationCap size={20} />
          </div>
        </div>
        <div className="kpi-foot">
          <span className="trend red-text"><TrendingUp size={13} /> Active</span>
          <span className="t-12 muted">enrolled students</span>
          <span className="pill">Live</span>
        </div>
        <div className="blob" style={{ background: "rgba(255,218,218,.3)" }} />
      </div>

      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Total Organizations</div>
            <div className="kpi-value">{s.totalOrganizations}</div>
          </div>
          <div className="kpi-icon" style={{ background: "#DAE2FD", color: "#0050D4" }}>
            <Building size={20} />
          </div>
        </div>
        <div className="kpi-foot">
          <span className="trend blue-text"><TrendingUp size={13} /> Registered</span>
          <span className="t-12 muted">active orgs</span>
        </div>
        <div className="blob" style={{ background: "rgba(218,226,253,.5)" }} />
      </div>

      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Scheduled Events</div>
            <div className="kpi-value">{s.scheduledEvents}</div>
          </div>
          <div className="kpi-icon" style={{ background: "#DDE9FF", color: "#8B263E" }}>
            <CalendarCheck size={20} />
          </div>
        </div>
        <div className="kpi-foot">
          <span className="live-dot" />
          <span className="t-12-600 muted">Next 30 days</span>
          {s.scheduledEvents > 10 && <span className="label-sm red-text">Busy</span>}
        </div>
      </div>

      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Pending Approvals</div>
            <div className="kpi-value">{s.pendingApprovals}</div>
          </div>
          <div className="kpi-icon" style={{ background: "#EFF4FF", color: "#2F6AF2" }}>
            <Clock size={18} />
          </div>
        </div>
        <div className="kpi-foot">
          <span className={s.pendingApprovals > 0 ? "trend red-text" : "trend"}>
            <LayoutGrid size={13} />
            {s.pendingApprovals > 0 ? " Needs review" : " All clear"}
          </span>
          <span className="t-12 muted">awaiting SAO decision</span>
        </div>
      </div>
    </section>
  );
}
