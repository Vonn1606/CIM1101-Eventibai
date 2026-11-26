"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

interface BrandLinkProps {
  className?: string;
  imgClassName?: string;
  ariaLabel?: string;
  src?: string;
}

/**
 * Role-aware Eventify brand logo link.
 * Admin -> /admin, Organizer -> /organizer-dashboard, Student -> /events, Guest -> /.
 */
export default function BrandLink({
  className = "",
  imgClassName = "h-9",
  ariaLabel = "Eventify Home",
  src = "/eventifytxt-cropped.svg",
}: BrandLinkProps) {
  const { role } = useAuth();

  const href =
    role === "admin"
      ? "/admin"
      : role === "organizer"
        ? "/organizer-dashboard"
        : role === "student"
          ? "/events"
          : "/";

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6c0c28]/40 rounded-md shrink-0 ${className}`}
    >
      <Image
        src={src}
        alt="Eventify"
        width={120}
        height={36}
        priority
        style={{ width: "auto" }}
        className={`w-auto object-contain transition-transform group-hover:scale-[1.02] ${imgClassName}`}
      />
    </Link>
  );
}
