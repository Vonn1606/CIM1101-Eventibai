import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-neutral-100">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <img
            src="/eventifytxt-cropped.svg"
            alt="Eventify"
            className="h-9 w-auto object-contain transition transform group-hover:scale-105"
          />
        </Link>
      </div>
    </header>
  );
}
