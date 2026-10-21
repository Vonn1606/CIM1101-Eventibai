import Link from "next/link";

export default function Hero() {
    return (
        <section className="hero-wrap">
            <div className="hero">
                <div className="hero-glow" />

                <div className="badge">
                    <span className="dot" />
                    <span className="badge-text">University of the East · Campus Events</span>
                </div>

                <h1 className="hero-title">
                    "Where team plans,
                    <br />
                    <em>Eventify happens.</em>
                </h1>

                <p className="hero-sub">
                    The unified collegiate platform for life-changing seminars, student organization
                    galas, amazing competitions, and entertaining events across University of The East.
                </p>

                <div className="hero-actions">
                    <Link href="/events" className="btn-primary">
                        <span>Get Started</span>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
                            <path d="M2 6.5h9M7 2.5l4 4-4 4" />
                        </svg>
                    </Link>
                    <Link href="/create" className="btn-secondary">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4D0011" strokeWidth="2" aria-hidden="true">
                            <path d="M7 2v10M2 7h10" />
                        </svg>
                        <span>Explore Events & Venues</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
