"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Wrench, X } from "lucide-react";

interface MaintenanceModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Accessible maintenance notice modal rendered via portal so header backdrop-filter
 * never traps fixed positioning.
 */
export default function MaintenanceModal({ open, onClose }: MaintenanceModalProps) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-sm rounded-2xl border border-neutral-200/80 bg-white p-7 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X size={16} />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#6c0c28]/10 text-[#6c0c28]">
          <Wrench size={22} />
        </div>

        <h2 id={titleId} className="mt-4 text-lg font-bold text-neutral-900">
          Sorry Under Maintenance!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Notifications are temporarily unavailable while we improve this feature.
        </p>

        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#6c0c28] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53091f]"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}
