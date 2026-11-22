"use client";
import { createClient } from "@/lib/supabase/client";
import { signInSchema } from "@/lib/validations";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate with signInSchema before calling Supabase auth
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Delegate role-lookup + redirect to the server — eliminates the extra
    // client-side DB round-trip that was causing login slowness.
    const next = new URLSearchParams(window.location.search).get("next");
    const redirectTo = next
      ? `/auth/redirect?next=${encodeURIComponent(next)}`
      : "/auth/redirect";

    router.push(redirectTo);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4 w-full">
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-800">
          University Email
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-xs text-neutral-400 font-normal pointer-events-none select-none">
            @
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@ue.edu.ph"
            className="w-full h-11 pl-9 pr-4 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-800">
          Password
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 pl-10 pr-10 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-600 transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.52 10.52 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex items-center justify-end text-xs text-neutral-600 pt-0.5">
        <Link href="/forgot-password" className="text-xs text-neutral-600 hover:text-neutral-900 transition font-normal">
          Forgot Password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full h-11 bg-[#F5F4F2] hover:bg-[#EBE9E6] text-neutral-800 font-semibold text-xs sm:text-sm rounded-xl transition active:scale-[0.99] flex items-center justify-center gap-2 border border-neutral-200/80 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span>{loading ? "Signing in…" : "Sign In to EVENTIFY"}</span>
        <span className="text-xs">→</span>
      </button>

      {/* Footer Link */}
      <div className="mt-5 text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
        <span>Don&apos;t have an account?</span>
        <Link href="/signup" className="font-medium text-neutral-800 hover:underline transition">
          Sign Up here &gt;
        </Link>
      </div>
    </form>
  );
}
