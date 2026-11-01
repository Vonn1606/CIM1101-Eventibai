"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

export default function Header() {
    const { user, loading, isOrganizer } = useAuth();

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
                    <Link href="/events" className="lp-nav-link">
                        Events
                    </Link>
                    {!loading && user ? (
                        <Link
                            href={isOrganizer ? "/organizer-dashboard" : "/my-events"}
                            className="nav-cta"
                        >
                            {isOrganizer ? "Organizer Dashboard" : "My Events"}
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
