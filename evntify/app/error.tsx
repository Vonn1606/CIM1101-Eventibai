"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-sm border border-neutral-100 p-8 flex flex-col items-center gap-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
          <svg
            className="w-7 h-7 text-rose-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-bold text-neutral-900">
            Something went wrong
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            An unexpected error occurred. Please try again, or contact support
            if the problem persists.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-neutral-400 mt-1">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 h-10 bg-[#F5F4F2] hover:bg-[#EBE9E6] text-neutral-800 font-semibold text-xs rounded-xl transition border border-neutral-200/80"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 h-10 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
