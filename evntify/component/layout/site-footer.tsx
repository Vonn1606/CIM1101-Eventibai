import Link from "next/link";
import BrandLink from "@/component/layout/brand-link";

const FOOTER_LINKS = [
  { label: "Events", href: "/events" },
  { label: "Guidelines", href: "/guidelines" },
  { label: "Policies", href: "/policies" },
] as const;

interface SiteFooterProps {
  className?: string;
}

/**
 * Shared application footer used across all public, student, organizer, and admin pages.
 */
export default function SiteFooter({ className = "" }: SiteFooterProps) {
  return (
    <footer
      className={`mt-auto w-full border-t border-neutral-200/70 bg-white px-6 py-8 shadow-[0_-1px_8px_rgba(0,0,0,0.03)] lg:px-10 ${className}`}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-1.5">
          <BrandLink src="/eventifyfooter.svg" imgClassName="h-7" />
          <p className="text-[11px] text-neutral-500">
            © 2026 Eventify · Campus Event Management Portal
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-neutral-600"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#6c0c28]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
