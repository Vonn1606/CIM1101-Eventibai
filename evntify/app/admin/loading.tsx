export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-3 border-[#8B1538] border-t-transparent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          Loading administrative console...
        </span>
      </div>
    </div>
  );
}
