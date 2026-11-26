"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import BrandLink from "@/component/layout/brand-link";

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
                <BrandLink />
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
                        !isAdmin && !isOrganizer ? (
                            <Link href="/my-events" className="nav-cta">
                                My Events
                            </Link>
                        ) : null
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
