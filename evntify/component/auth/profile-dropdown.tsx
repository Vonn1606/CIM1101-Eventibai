"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileDropdownProps = {
  name: string;
  role: string;
  onClose: () => void;
};

export default function ProfileDropdown({ name, role, onClose }: ProfileDropdownProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  /* Close on outside click or Escape */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/signin");
    router.refresh();
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Account menu"
      className="absolute right-0 z-[100] flex flex-col items-start bg-white"
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        zIndex: 100,
        width: "196px",
        minWidth: "196px",
        maxWidth: "196px",
        padding: "6px",
        background: "#ffffff",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(220, 205, 200, 0.5)",
        borderRadius: "18px",
        boxShadow:
          "0 16px 36px -6px rgba(44, 24, 28, 0.12), 0 6px 16px -2px rgba(44, 24, 28, 0.05)",
        boxSizing: "border-box",
        textAlign: "left",
      }}
    >
      {/* Header Info */}
      <div
        style={{
          width: "100%",
          padding: "10px 12px 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            margin: 0,
            padding: 0,
            fontSize: "15px",
            fontWeight: 700,
            lineHeight: "20px",
            color: "#1e1b19",
            letterSpacing: "-0.2px",
            fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "left",
          }}
        >
          {name}
        </p>
        <p
          style={{
            margin: "3px 0 0",
            padding: 0,
            fontSize: "11px",
            fontWeight: 700,
            lineHeight: "14px",
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: "#8a7b78",
            fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
            width: "100%",
            textAlign: "left",
          }}
        >
          {role}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          width: "calc(100% - 16px)",
          height: "1px",
          margin: "2px 8px 4px",
          backgroundColor: "#f0eae6",
          boxSizing: "border-box",
        }}
      />

      {/* Log Out button */}
      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          height: "40px",
          padding: "8px 12px",
          border: 0,
          borderRadius: "10px",
          backgroundColor: isHovered ? "rgba(186, 26, 26, 0.06)" : "transparent",
          color: "#ba1a1a",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 500,
          fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
          transition: "background-color 0.15s ease",
          boxSizing: "border-box",
          textAlign: "left",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ba1a1a"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            width: "16px",
            minWidth: "16px",
            maxWidth: "16px",
            height: "16px",
            minHeight: "16px",
            maxHeight: "16px",
            flexShrink: 0,
            display: "block",
          }}
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span
          style={{
            color: "#ba1a1a",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "20px",
            letterSpacing: "-0.1px",
          }}
        >
          Log Out
        </span>
      </button>
    </div>
  );
}
