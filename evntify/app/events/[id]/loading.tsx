export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header skeleton */}
      <div className="h-20 bg-neutral-100 border-b border-neutral-200" />

      {/* Banner skeleton */}
      <div className="h-64 bg-neutral-200" />

      {/* Content skeleton */}
      <div className="mx-auto max-w-[1200px] px-6 py-10 flex flex-col gap-6">
        <div className="h-8 w-2/3 bg-neutral-200 rounded-lg" />
        <div className="h-4 w-1/3 bg-neutral-100 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-4 bg-neutral-100 rounded w-full" />
            <div className="h-4 bg-neutral-100 rounded w-5/6" />
            <div className="h-4 bg-neutral-100 rounded w-4/6" />
          </div>
          <div className="h-64 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
