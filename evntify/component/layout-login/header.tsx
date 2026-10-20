'use client';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import Image from "next/image"

export default function Header() {
  const pathname = usePathname();
  const isSignIn = pathname === '/signin';

  return (
    <header className="w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between relative z-10">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-2.5 group focus:outline-none"
      >
        <img
          src="/eventifytxt-cropped.svg"
          alt="Eventify"
          className="h-9  w-auto object-contain transition transform group-hover:scale-105"
        />
      </Link>

      {/* Utility nav */}
      <nav className="flex items-center gap-6 text-xs font-semibold text-slate-600">
        <a
          className="hover:text-rose-700 transition flex items-center gap-1.5"
          href="#help"
        >
          <svg
            className="w-4 h-4 opacity-75"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </svg>
          Need Help?
        </a>
        <a
          className="hover:text-rose-700 transition flex items-center gap-1.5"
          href="#safety"
        >
          <svg
            className="w-4 h-4 opacity-75"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Campus Safety
        </a>
        <div className="hidden sm:block h-3.5 w-px bg-slate-300" />
        <Link
          className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs transition"
          href={isSignIn ? '/signup' : '/signin'}
        >
          {isSignIn ? 'Sign Up' : 'Sign In'}
        </Link>
      </nav>
    </header>
  );
}
