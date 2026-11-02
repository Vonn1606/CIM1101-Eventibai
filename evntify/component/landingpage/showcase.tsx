import { marqueeRows, type EventCard } from "@/app/data/events";

function Card({ title }: EventCard) {
  return (
    <article className="lp-card">
      <div className="card-media">
        <svg width="27" height="30" viewBox="0 0 27 30" fill="rgba(77,0,17,0.4)" aria-hidden="true">
          <rect x="1" y="4" width="25" height="25" rx="3" />
          <rect x="6" y="0" width="3" height="7" rx="1.5" />
          <rect x="18" y="0" width="3" height="7" rx="1.5" />
        </svg>
      </div>
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
      </div>
    </article>
  );
}

export default function Showcase() {
  return (
    <section id="events" className="showcase scroll-mt-20">
      <div className="showcase-head">
        <div className="showcase-head-text">
          <span className="lp-dot" />
          <h2 className="showcase-title">Moments from around campus</h2>
          <p className="showcase-sub">
            A glimpse of the events that bring the university community together.
          </p>
        </div>
        <div className="live-pill">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="#00281D" aria-hidden="true">
            <circle cx="6" cy="6" r="5" />
          </svg>
          <span>Live Updates</span>
        </div>
      </div>

      <div className="marquee-stack">
        {marqueeRows.map((row, i: number) => (
          <div className="marquee" key={i}>
            <div className={`marquee-track ${row.direction}`}>
              {/* Duplicated so the loop is seamless */}
              {[...row.cards, ...row.cards, ...row.cards].map((c, j) => (
                <Card key={j} {...c} />
              ))}
            </div>
          </div>
        ))}
        <div className="fade fade-left" />
        <div className="fade fade-right" />
      </div>
    </section>
  );
}
