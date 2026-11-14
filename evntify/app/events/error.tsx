"use client";

import Link from "next/link";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#f9f9fc] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-2">Error</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          {error.message || "Failed to load events. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-[#6c0c28] text-white font-bold text-sm hover:bg-[#8b263e] transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-bold text-sm hover:bg-neutral-200 transition"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

