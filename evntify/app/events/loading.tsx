export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-[#f9f9fc] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c0c28] border-t-transparent" />
        <p className="text-xs font-semibold text-neutral-500">Loading events…</p>
      </div>
    </div>
  );
}

