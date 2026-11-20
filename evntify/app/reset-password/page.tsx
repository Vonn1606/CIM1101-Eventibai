"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase sets the session from the URL hash after the redirect
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/signin"), 2500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-sm border border-neutral-100 p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold text-neutral-900">New Password</h1>
          <p className="text-xs text-neutral-500">
            Choose a strong new password for your account.
          </p>
        </div>

        {success ? (
          <div
            className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-800 font-medium"
            role="status"
            aria-live="polite"
          >
            ✓ Password updated! Redirecting to sign in…
          </div>
        ) : !ready ? (
          <div className="text-sm text-neutral-500 text-center py-4">
            Verifying reset link…
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
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#F5F4F2] hover:bg-[#EBE9E6] text-neutral-800 font-semibold text-xs sm:text-sm rounded-xl transition active:scale-[0.99] flex items-center justify-center gap-2 border border-neutral-200/80 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
