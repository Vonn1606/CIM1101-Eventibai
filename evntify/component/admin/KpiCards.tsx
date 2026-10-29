import { GraduationCap, Building, CalendarCheck, LayoutGrid, TrendingUp } from "lucide-react";

export default function KpiCards() {
  return (
    <section className="kpis">
      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Total Students</div>
            <div className="kpi-value">4,820</div>
          </div>
          <div className="kpi-icon" style={{ background: "#E6EEFF", color: "#8B263E" }}><GraduationCap size={20} /></div>
        </div>
        <div className="kpi-foot">
          <span className="trend red-text"><TrendingUp size={13} /> 12%</span>
          <span className="t-12 muted">vs last term</span>
          <span className="pill">Active</span>
        </div>
        <div className="blob" style={{ background: "rgba(255,218,218,.3)" }} />
      </div>

      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Total Organizations</div>
            <div className="kpi-value">38</div>
          </div>
          <div className="kpi-icon" style={{ background: "#DAE2FD", color: "#0050D4" }}><Building size={20} /></div>
        </div>
        <div className="kpi-foot">
          <span className="trend blue-text"><TrendingUp size={13} /> 4 new</span>
          <span className="t-12 muted">this month</span>
        </div>
        <div className="blob" style={{ background: "rgba(218,226,253,.5)" }} />
      </div>

      <div className="card kpi">
        <div className="kpi-top">
          <div>
            <div className="label">Scheduled Events</div>
            <div className="kpi-value">24</div>
          </div>
          <div className="kpi-icon" style={{ background: "#DDE9FF", color: "#8B263E" }}><CalendarCheck size={20} /></div>
        </div>
        <div className="kpi-foot">
          <span className="live-dot" />
          <span className="t-12-600 muted">Next 30 days</span>
          <span className="label-sm red-text">Busy</span>
        </div>
      </div>

      <div className="card kpi kpi-tall">
        <div className="kpi-top">
          <div>
            <div className="label">Venue Booking Density</div>
            <div className="kpi-value">88.5%</div>
          </div>
          <div className="kpi-icon" style={{ background: "#EFF4FF", color: "#2F6AF2" }}><LayoutGrid size={18} /></div>
        </div>
        <div className="density">
          <div className="cap-row">
            <span className="label-sm">Utilization</span>
            <span className="label-sm dark">88.5%</span>
          </div>
          <div className="bar"><span style={{ width: "88.5%", background: "#8B263E" }} /></div>
        </div>
      </div>
    </section>
  );
}
