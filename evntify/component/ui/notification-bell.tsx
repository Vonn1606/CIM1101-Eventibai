"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import MaintenanceModal from "@/component/ui/maintenance-modal";

interface NotificationBellProps {
  className?: string;
  iconSize?: number;
}

/**
 * Disabled notification bell button that opens MaintenanceModal (no link, no unread dot).
 */
export default function NotificationBell({
  className = "",
  iconSize = 18,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Notifications"
        title="Notifications"
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 hover:text-[#6c0c28] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6c0c28]/30 ${className}`}
      >
        <Bell size={iconSize} />
      </button>
      <MaintenanceModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
