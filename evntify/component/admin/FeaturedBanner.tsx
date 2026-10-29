import { Radio, MapPin, Clock } from "lucide-react";

export default function FeaturedBanner() {
  return (
    <section className="banner">
      <div className="banner-body">
        <span className="live-chip">
          <Radio size={11} color="#22C55E" />
          <span>Featured assembly: live planning</span>
        </span>
        <div className="banner-meta">
          <span className="meta green"><MapPin size={12} /> Main Auditorium</span>
          <span className="sep">/</span>
          <span className="meta"><Clock size={12} /> Dec 12, 7:00 PM</span>
        </div>
        <h2 className="banner-title">The 40th Anniversary Concert: Finale</h2>
        <p className="banner-text">
          Closing night of the anniversary season, bringing together student ensembles,
          alumni performers and guest conductors for a full-house celebration.
        </p>
      </div>
      <div className="banner-foot">
        <div className="status">
          <span className="status-dot" />
          <span>Final approvals pending</span>
        </div>
        <div className="pager">
          <span className="on" /><span /><span /><span />
        </div>
      </div>
    </section>
  );
}
