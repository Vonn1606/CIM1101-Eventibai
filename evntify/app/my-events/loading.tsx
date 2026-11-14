export default function MyEventsLoading() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-3 border-[#8B1538] border-t-transparent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6B68]">
          Loading your event passes &amp; schedule...
        </span>
      </div>
    </div>
  );
}
