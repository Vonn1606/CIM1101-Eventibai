import { Radio, MapPin, Clock } from "lucide-react";
import type { FeaturedEventItem } from "@/lib/db/stats";

interface FeaturedBannerProps {
  event?: FeaturedEventItem;
}

export default function FeaturedBanner({ event }: FeaturedBannerProps) {
  if (!event) {
    return (
      <section className="banner">
        <div className="banner-body">
          <span className="live-chip">
            <Radio size={11} color="#8A7B78" />
            <span>Featured assembly: None active</span>
          </span>
          <h2 className="banner-title" style={{ opacity: 0.75 }}>
            No Featured Event Active
          </h2>
          <p className="banner-text" style={{ opacity: 0.65 }}>
            No campus assembly or event is currently designated as featured. Mark an approved event as featured in the directory to spotlight it on this dashboard.
          </p>
        </div>
      </section>
    );
  }

  const title = event.title;
  const venue = event.venue;
  const status = event.status;
  const summary =
    event.summary ||
    "Official highlighted campus event scheduled and verified by university administration.";

  const dateLabel = event.starts_at
    ? new Date(event.starts_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Date TBD";

  const statusLabel =
    status === "approved"
      ? "Approved"
      : status === "ongoing"
      ? "Live now"
      : "Scheduled";

  return (
    <section className="banner">
      <div className="banner-body">
        <span className="live-chip">
          <Radio size={11} color="#22C55E" />
          <span>Featured assembly: spotlight</span>
        </span>
        <div className="banner-meta">
          <span className="meta green"><MapPin size={12} /> {venue}</span>
          <span className="sep">/</span>
          <span className="meta"><Clock size={12} /> {dateLabel}</span>
        </div>
        <h2 className="banner-title">{title}</h2>
        <p className="banner-text">{summary}</p>
      </div>
      <div className="banner-foot">
        <div className="status">
          <span className="status-dot" />
          <span>{statusLabel}</span>
        </div>
      </div>
    </section>
  );
}
