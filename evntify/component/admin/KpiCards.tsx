<<<<<<< Updated upstream
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
=======
import { GraduationCap, Building, CalendarCheck, LayoutGrid, TrendingUp } from "lucide-react";
import type { AdminKpis } from "@/lib/db/admin";

interface Props {
  kpis: AdminKpis;
}

export default function KpiCards({ kpis }: Props) {
  const densityPct = `${kpis.venueDensity}%`;
>>>>>>> Stashed changes

  return (
    <section className="kpis">
      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Total Students</div>
<<<<<<< Updated upstream
            <div className="kpi-value">{s.totalStudents.toLocaleString()}</div>
          </div>
          <div className="kpi-icon" style={{ background: "#E6EEFF", color: "#8B263E" }}>
            <GraduationCap size={20} />
=======
            <div className="kpi-value">{kpis.totalStudents.toLocaleString()}</div>
>>>>>>> Stashed changes
          </div>
        </div>
        <div className="kpi-foot">
<<<<<<< Updated upstream
          <span className="trend red-text"><TrendingUp size={13} /> Active</span>
          <span className="t-12 muted">enrolled students</span>
          <span className="pill">Live</span>
=======
          <span className="trend red-text"><TrendingUp size={13} /> {kpis.studentTrend}%</span>
          <span className="t-12 muted">vs last term</span>
          <span className="pill">Active</span>
>>>>>>> Stashed changes
        </div>
        <div className="blob" style={{ background: "rgba(255,218,218,.3)" }} />
      </div>

      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Total Organizations</div>
<<<<<<< Updated upstream
            <div className="kpi-value">{s.totalOrganizations}</div>
          </div>
          <div className="kpi-icon" style={{ background: "#DAE2FD", color: "#0050D4" }}>
            <Building size={20} />
=======
            <div className="kpi-value">{kpis.totalOrganizations}</div>
>>>>>>> Stashed changes
          </div>
        </div>
        <div className="kpi-foot">
<<<<<<< Updated upstream
          <span className="trend blue-text"><TrendingUp size={13} /> Registered</span>
          <span className="t-12 muted">active orgs</span>
=======
          <span className="trend blue-text"><TrendingUp size={13} /> {kpis.newOrgsThisMonth} new</span>
          <span className="t-12 muted">this month</span>
>>>>>>> Stashed changes
        </div>
        <div className="blob" style={{ background: "rgba(218,226,253,.5)" }} />
      </div>

      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Scheduled Events</div>
<<<<<<< Updated upstream
            <div className="kpi-value">{s.scheduledEvents}</div>
          </div>
          <div className="kpi-icon" style={{ background: "#DDE9FF", color: "#8B263E" }}>
            <CalendarCheck size={20} />
=======
            <div className="kpi-value">{kpis.scheduledEvents}</div>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            <div className="label">Pending Approvals</div>
            <div className="kpi-value">{s.pendingApprovals}</div>
          </div>
          <div className="kpi-icon" style={{ background: "#EFF4FF", color: "#2F6AF2" }}>
            <Clock size={18} />
=======
            <div className="label">Venue Booking Density</div>
            <div className="kpi-value">{densityPct}</div>
>>>>>>> Stashed changes
          </div>
          <div className="kpi-icon" style={{ background: "#EFF4FF", color: "#2F6AF2" }}><LayoutGrid size={18} /></div>
        </div>
<<<<<<< Updated upstream
        <div className="kpi-foot">
          <span className={s.pendingApprovals > 0 ? "trend red-text" : "trend"}>
            <LayoutGrid size={13} />
            {s.pendingApprovals > 0 ? " Needs review" : " All clear"}
          </span>
          <span className="t-12 muted">awaiting SAO decision</span>
=======
        <div className="density">
          <div className="cap-row">
            <span className="label-sm">Utilization</span>
            <span className="label-sm dark">{densityPct}</span>
          </div>
          <div className="bar"><span style={{ width: densityPct, background: "#8B263E" }} /></div>
>>>>>>> Stashed changes
        </div>
      </div>
    </section>
  );
}
