export default function OrganizerLoading() {
  return (
    <div className="min-h-screen bg-[#FAF5F2] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-3 border-[#651C32] border-t-transparent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6B68]">
          Loading organizer portal &amp; rosters...
        </span>
      </div>
    </div>
  );
}
