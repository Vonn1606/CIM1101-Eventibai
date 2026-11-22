"use client";

import { useEffect } from "react";

export default function EventsDirectoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-96 w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-lg font-bold text-ink">Failed to load events directory</h2>
      <p className="text-xs text-muted max-w-md">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-maroon px-4 py-2 text-xs font-semibold text-white hover:bg-maroon-light transition"
      >
        Try again
      </button>
    </div>
  );
}
