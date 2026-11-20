"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${origin}/reset-password` }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-sm border border-neutral-100 p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold text-neutral-900">Reset Password</h1>
          <p className="text-xs text-neutral-500">
            Enter your university email and we&apos;ll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div
            className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-800 font-medium"
            role="status"
            aria-live="polite"
          >
            ✓ Check your email for a password reset link. It may take a few
            minutes to arrive.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div
                className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700 font-medium"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                University Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@ue.edu.ph"
                className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#F5F4F2] hover:bg-[#EBE9E6] text-neutral-800 font-semibold text-xs sm:text-sm rounded-xl transition active:scale-[0.99] flex items-center justify-center gap-2 border border-neutral-200/80 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-neutral-500">
          <Link
            href="/signin"
            className="font-medium text-neutral-800 hover:underline transition"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
