export default function NotificationsLoading() {
  return (
    <div
      className="min-h-screen bg-[#FAF8F6] animate-pulse"
      role="status"
      aria-label="Loading notifications"
    >
      <div className="mx-auto max-w-[720px] px-4 py-10 flex flex-col gap-4">
        <div className="h-7 w-40 bg-neutral-200 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-2xl bg-white border border-neutral-100 shadow-sm p-4"
          >
            <div className="h-10 w-10 rounded-full bg-neutral-200 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3.5 bg-neutral-200 rounded w-3/4" />
              <div className="h-3 bg-neutral-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
