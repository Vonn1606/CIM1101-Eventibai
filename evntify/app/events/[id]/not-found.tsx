import Link from "next/link";

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-[#f9f9fc] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6c0c28] mb-2">404 — Event Not Found</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 mb-3">
          This event doesn&apos;t exist
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          The event you&apos;re looking for may have been removed, expired, or the link is incorrect.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6c0c28] text-white font-bold text-sm hover:bg-[#8b263e] transition"
        >
          ← Back to Events
        </Link>
      </div>
    </div>
  );
}

