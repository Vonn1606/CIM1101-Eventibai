import { Radio, MapPin, Clock } from "lucide-react";
import type { FeaturedEventItem } from "@/lib/db/stats";

interface FeaturedBannerProps {
  event?: FeaturedEventItem;
}

export default function FeaturedBanner({ event }: FeaturedBannerProps) {
  const title = event?.title ?? "The 40th Anniversary Concert: Finale";
  const venue = event?.venue ?? "Main Auditorium";
  const status = event?.status ?? "pending";

  const dateLabel = event?.starts_at
    ? new Date(event.starts_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Dec 12, 7:00 PM";

  const statusLabel =
    status === "approved"
      ? "Approved"
      : status === "ongoing"
      ? "Live now"
      : "Final approvals pending";

  return (
    <section className="banner">
      <div className="banner-body">
        <span className="live-chip">
          <Radio size={11} color="#22C55E" />
          <span>Featured assembly: live planning</span>
        </span>
        <div className="banner-meta">
          <span className="meta green"><MapPin size={12} /> {venue}</span>
          <span className="sep">/</span>
          <span className="meta"><Clock size={12} /> {dateLabel}</span>
        </div>
        <h2 className="banner-title">{title}</h2>
        <p className="banner-text">
          Closing night of the anniversary season, bringing together student ensembles,
          alumni performers and guest conductors for a full-house celebration.
        </p>
      </div>
      <div className="banner-foot">
        <div className="status">
          <span className="status-dot" />
          <span>{statusLabel}</span>
        </div>
        <div className="pager">
          <span className="on" /><span /><span /><span />
        </div>
      </div>
    </section>
  );
}
