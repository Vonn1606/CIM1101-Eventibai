export default function AmbientBackdrop() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
      <div className="sky-arc top-28 opacity-80" />
      <div
        className="ambient-cloud w-96 h-96 bg-rose-200/50 -top-20 left-1/4 animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div className="ambient-cloud w-[32rem] h-[32rem] bg-indigo-100/60 bottom-0 right-1/4" />
      <div className="ambient-cloud w-80 h-80 bg-pink-100/80 top-1/2 left-10" />
      {/* Soft light beam effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 pointer-events-none" />
    </div>
  );
}
