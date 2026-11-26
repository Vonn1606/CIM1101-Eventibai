import React from "react";
import BrandLink from "@/component/layout/brand-link";

export const SITE_HEADER_TOKENS = {
  publicHeight: "h-20",
  dashboardHeight: "h-16",
  logoClass: "h-9 w-auto",
} as const;

interface SiteHeaderProps {
  /** "public" = 80px (h-20) for public/student pages; "dashboard" = 64px (h-16) for admin/organizer top bars */
  variant?: "public" | "dashboard";
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  hideBrand?: boolean;
  maxWidthClassName?: string;
  className?: string;
}

/**
 * Shared header shell enforcing P0-5 height and logo standards.
 */
export default function SiteHeader({
  variant = "public",
  leftSlot,
  centerSlot,
  rightSlot,
  hideBrand = false,
  maxWidthClassName = "max-w-[1280px]",
  className = "",
}: SiteHeaderProps) {
  const heightClass =
    variant === "dashboard"
      ? SITE_HEADER_TOKENS.dashboardHeight
      : SITE_HEADER_TOKENS.publicHeight;

  return (
    <header
      role="banner"
      className={`sticky top-0 z-30 w-full border-b border-[#EAE4E1] bg-white/95 backdrop-blur-md ${heightClass} ${className}`}
    >
      <div
        className={`mx-auto flex h-full w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 ${maxWidthClassName}`}
      >
        <div className="flex items-center gap-3 shrink-0">
          {leftSlot}
          {!hideBrand && <BrandLink />}
        </div>

        {centerSlot ? (
          <div className="flex-1 flex justify-center min-w-0">{centerSlot}</div>
        ) : null}

        {rightSlot ? (
          <div className="flex items-center gap-2.5 shrink-0">{rightSlot}</div>
        ) : null}
      </div>
    </header>
  );
}
