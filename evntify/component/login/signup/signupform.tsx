"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";

const inputClass =
  "block w-full h-11 pl-10 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition py-2.5";
const labelClass = "block text-xs font-semibold text-neutral-800 mb-1.5";
const leftIconWrap =
  "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400";

/** A college row loaded from the `colleges` table by the sign-up page. */
export type CollegeOption = { slug: string; name: string };

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  return {
    percent: password ? Math.max(score, 1) * 25 : 0,
    label: password ? labels[score] : "",
  };
}

export default function SignUpForm({ colleges }: { colleges: CollegeOption[] }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [college, setCollege] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signUp({
      full_name: fullName,
      email: schoolEmail,
      student_number: studentNumber,
      college,
      password,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Show email confirmation message instead of silently redirecting
    setEmailSent(true);
    setLoading(false);
  }

  return (
    <form className="mt-6 space-y-4 w-full" onSubmit={handleSubmit}>
      {/* Server error */}
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {emailSent && (
        <div
          className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-800 font-medium"
          role="status"
          aria-live="polite"
        >
          ✓ Account created! Check your <strong>UE email</strong> to confirm
          your account before signing in.
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className={labelClass} htmlFor="fullName">
          Full Name
        </label>
        <div className="relative rounded-xl">
          <div className={leftIconWrap}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            className={`${inputClass} pr-3.5`}
            id="fullName"
            name="fullName"
            placeholder="e.g., Alex Dela Cruz"
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      </div>

      {/* School Email */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-neutral-800" htmlFor="schoolEmail">
            School Email
          </label>
          <span className="text-[10px] font-medium text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
            @ue.edu.ph only
          </span>
        </div>
        <div className="relative rounded-xl">
          <div className={leftIconWrap}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            className={`${inputClass} pr-3.5`}
            id="schoolEmail"
            name="schoolEmail"
            placeholder="student@ue.edu.ph"
            required
            type="email"
            value={schoolEmail}
            onChange={(e) => setSchoolEmail(e.target.value)}
          />
        </div>
        <p className="mt-1 text-[11px] text-neutral-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Official UE campus email required for verification
        </p>
      </div>

      {/* Student Number */}
      <div>
        <label className={labelClass} htmlFor="studentNumber">
          Student Number
        </label>
        <div className="relative rounded-xl">
          <div className={leftIconWrap}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />
            </svg>
          </div>
          <input
            className={`${inputClass} pr-3.5`}
            id="studentNumber"
            name="studentNumber"
            placeholder="2023-12345-MN"
            required
            type="text"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
        </div>
      </div>

      {/* College */}
      <div>
        <label className={labelClass} htmlFor="college">
          College
        </label>
        <div className="relative rounded-xl">
          <div className={leftIconWrap}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />
            </svg>
          </div>
          <select
            className={`${inputClass} pr-9 appearance-none cursor-pointer bg-white text-neutral-600`}
            id="college"
            name="college"
            required
            disabled={colleges.length === 0}
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          >
            <option disabled value="">
              {colleges.length === 0 ? "Colleges unavailable, try again later" : "Select your college..."}
            </option>
            {colleges.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Password */}
      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <div className="relative rounded-xl">
          <div className={leftIconWrap}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <input
            className={`${inputClass} pr-11`}
            id="password"
            name="password"
            placeholder="Min. 8 characters"
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            aria-label="Toggle password visibility"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
            type="button"
          >
            {showPassword ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.52 10.52 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Live Password Strength detector */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="h-1 flex-1 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E53935] rounded-full transition-all duration-300"
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[#E53935] min-w-[2.5rem] text-right">
            {strength.label}
          </span>
        </div>
      </div>

      {/* Verification pill */}
      <div className="p-3 rounded-xl bg-[#FDF2F4] border border-[#FADBE1] flex items-center gap-2.5">
        <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[11px] text-neutral-600">
          Instant verification &amp; registered into the university event directory.
        </span>
      </div>

      {/* Terms checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          className="h-4 w-4 text-neutral-800 border-neutral-300 rounded focus:ring-0 cursor-pointer"
          id="terms"
          name="terms"
          required
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <label className="text-xs text-neutral-600 select-none cursor-pointer" htmlFor="terms">
          I agree to the{" "}
          <Link className="text-neutral-800 underline underline-offset-2 hover:text-black font-medium" href="/guidelines">
            Eventify Guidelines
          </Link>{" "}
          &amp;{" "}
          <Link className="text-neutral-800 underline underline-offset-2 hover:text-black font-medium" href="/policies">
            Eventify Policies
          </Link>
          .
        </label>
      </div>

      {/* Submit button */}
      <button
        className="w-full mt-3 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#10141D] hover:bg-[#1C2230] active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        <span>{loading ? "Creating account…" : "Create Account & Register"}</span>
        <span className="text-xs">→</span>
      </button>

      {/* Footer link */}
      <div className="pt-3 text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
        <span>Already registered for events?</span>
        <Link href="/signin" className="font-semibold text-neutral-900 hover:underline transition">
          Sign in here
        </Link>
      </div>
    </form>
  );
}
