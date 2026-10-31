import Link from "next/link";

const links = [
    { label: "Help Center", href: "#help" },
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Campus Safety", href: "#safety" },
    { label: "Event Guidelines", href: "#guidelines" },
];

export default function AppFooter() {
    return (
        <footer className="mt-auto w-full bg-white shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
            <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-6 py-8 md:flex-row md:items-center md:px-10">
                <div className="flex flex-col gap-1">
                    <span className="font-display text-xl font-extrabold italic text-wine">eventify</span>
                    <p className="text-[11px] text-muted">
                        © 2026 Eventify. The official campus events directory.
                    </p>
                </div>
                <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
                    {links.map((l) => (
                        <Link key={l.label} href={l.href} className="hover:text-wine transition-colors">
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
