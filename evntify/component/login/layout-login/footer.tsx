import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-neutral-100 py-6">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Brand and Copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs text-neutral-500">
          <Link href="/" className="inline-block focus:outline-none">
            <span className="font-serif italic font-bold text-lg text-[#8B1E3F] tracking-tight">
              eventify.
            </span>
          </Link>
          <span className="text-[11px] text-neutral-400">
            © 2025 Eventify Campus Inc. All rights reserved. Connecting university life &amp; student culture.
          </span>
        </div>

        {/* Right Navigation Links */}
        <nav className="flex flex-wrap items-center gap-5 sm:gap-6 text-xs text-neutral-500 font-medium">
          <Link href="/privacy" className="hover:text-neutral-900 transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-neutral-900 transition">
            Terms of Service
          </Link>
          <Link href="/events" className="hover:text-neutral-900 transition">
            Event Directory
          </Link>
          <Link href="/colleges" className="hover:text-neutral-900 transition">
            Academic Colleges
          </Link>
        </nav>
      </div>
    </footer>
  );
}
