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
        <header className="header fixed inset-x-0 top-0 z-50 h-20 w-full bg-[#fff8f5]/80 backdrop-blur-md shadow-[0_1px_8px_#0000000a]">
            <div className="header-inner mx-auto flex h-full w-full max-w-[1320px] items-center justify-between px-6 sm:px-12">
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
                <nav className="header-nav flex items-center gap-4">
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
