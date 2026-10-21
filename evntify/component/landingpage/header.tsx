import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="header">
            <div className="header-inner">
                <Link href="/" aria-label="Eventify home" className="header-logo">
                    <Image src="/eventifytext.svg" alt="Eventify" width={142} height={142} priority />
                </Link>
                <nav className="header-nav">
                    <Link href="/events" className="nav-link">
                        Events
                    </Link>
                    <Link href="/login" className="nav-cta">
                        Sign In
                    </Link>
                    <button type="button" className="nav-avatar" aria-label="Account">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff" aria-hidden="true">
                            <circle cx="6" cy="4" r="2.5" />
                            <path d="M1 11c0-2.5 2.2-4 5-4s5 1.5 5 4z" />
                        </svg>
                    </button>
                </nav>
            </div>
        </header>
    );
}