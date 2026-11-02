"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

export default function Header() {
    const { user, loading, isOrganizer, isAdmin } = useAuth();

    const handleScroll = (id: string) => (e: React.MouseEvent) => {
        const el = document.getElementById(id);
        if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header className="header">
            <div className="header-inner">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 group focus:outline-none"
                >
                    <img
                        src="/eventifytxt-cropped.svg"
                        alt="Eventify"
                        className="h-9 w-auto object-contain transition transform group-hover:scale-105"
                    />
                </Link>
                <nav className="header-nav">
                    <Link
                        href="/#events"
                        onClick={handleScroll("events")}
                        className="lp-nav-link"
                    >
                        Events
                    </Link>
                    <Link
                        href="/#about"
                        onClick={handleScroll("about")}
                        className="lp-nav-link"
                    >
                        About
                    </Link>
                    {!loading && user ? (
                        <Link
                            href={
                                isAdmin
                                    ? "/admin"
                                    : isOrganizer
                                    ? "/organizer-dashboard"
                                    : "/my-events"
                            }
                            className="nav-cta"
                        >
                            {isAdmin
                                ? "Admin Portal"
                                : isOrganizer
                                ? "Organizer Dashboard"
                                : "My Events"}
                        </Link>
                    ) : (
                        <Link href="/signin" className="nav-cta">
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
