import Link from "next/link";

export default function Footer() {
  const links = [
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
    { label: "Support", href: "#support" },
    { label: "Campus Map", href: "#map" },
  ];

  return (
    <footer className="bg-white px-6 lg:px-10 py-8 shadow-[0_-1px_8px_rgba(0,0,0,0.03)] border-t border-surface-high">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-serif-display text-xl font-extrabold italic text-maroon">Eventify</span>
          <p className="text-[11px] text-body">© 2026 Eventify · Campus Event Management Portal</p>
        </div>
        <nav className="flex gap-5">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="text-[11px] text-body hover:underline transition">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

