export default function EventsDirectoryLoading() {
  return (
    <div className="flex h-96 w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-maroon border-t-transparent" />
        <p className="text-xs font-semibold text-muted">Loading events directory...</p>
      </div>
    </div>
  );
}
