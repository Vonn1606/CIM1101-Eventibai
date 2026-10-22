"use client";

import { FormEvent, useMemo, useState } from "react";

const inputClass =
  "block w-full h-11 pl-10 text-sm bg-white/70 border border-slate-200/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition duration-150 py-2.5";
const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5";
const leftIconWrap =
  "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400";

const DEPARTMENTS = [
  { value: "eng", label: "College of Engineering & Architecture" },
  { value: "cs", label: "Lucio Tan College of Computer Studies" },
  { value: "biz", label: "Tan Yan Kee Business & Accountancy" },
  { value: "arts", label: "College of Arts and Sciences" },
  { value: "med", label: "Institute of Health Sciences & Medicine" },
  { value: "law", label: "College of Law & Public Administration" },
];

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

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const strength = useMemo(() => getStrength(password), [password]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    // TODO: send `data` to your API route / auth provider
    console.log("Sign up submitted:", { ...data, password: "[hidden]" });
  }

  return (
    <form
      className="mt-6 space-y-4"
      data-purpose="student-signup-form"
      onSubmit={handleSubmit}
    >
      {/* Full Name */}
      <div>
        <label className={labelClass} htmlFor="fullName">
          Full Name
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className={leftIconWrap}>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            className={`${inputClass} pr-3.5`}
            id="fullName"
            name="fullName"
            placeholder="e.g., Alex Dela Cruz"
            required
            type="text"
          />
        </div>
      </div>

      {/* School Email */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            className="block text-xs font-semibold text-slate-700"
            htmlFor="schoolEmail"
          >
            School Email
          </label>
          <span className="text-[10px] font-medium text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
            Verification Required
          </span>
        </div>
        <div className="relative rounded-xl shadow-xs">
          <div className={leftIconWrap}>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            className={`${inputClass} pr-3.5`}
            id="schoolEmail"
            name="schoolEmail"
            placeholder="student@university.edu.ph"
            required
            type="email"
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
          <svg
            className="w-3 h-3 text-slate-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              fillRule="evenodd"
            />
          </svg>
          Official campus domain required for student verification
        </p>
      </div>

      {/* College / Department */}
      <div>
        <label className={labelClass} htmlFor="campusDepartment">
          College/Department
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className={leftIconWrap}>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <select
            className={`${inputClass} pr-9 appearance-none cursor-pointer`}
            id="campusDepartment"
            name="campusDepartment"
            required
            defaultValue=""
          >
            <option disabled value="">
              Select your college or faculty...
            </option>
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Password */}
      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className={leftIconWrap}>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
            type="button"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {showPassword ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              ) : (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Strength indicator (live) */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-rose-600 min-w-[2.5rem] text-right">
            {strength.label}
          </span>
        </div>
      </div>

      {/* Verification badge */}
      <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[11px] font-medium text-slate-600">
          Instant verification &amp; registered into the university event
          directory.
        </span>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2.5 pt-1">
        <div className="flex items-center h-5">
          <input
            className="h-4 w-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500 cursor-pointer"
            id="terms"
            name="terms"
            required
            type="checkbox"
          />
        </div>
        <label
          className="text-xs text-slate-600 leading-tight cursor-pointer"
          htmlFor="terms"
        >
          I agree to the{" "}
          <a
            className="font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2"
            href="#"
          >
            Campus Event Guidelines
          </a>{" "}
          &amp;{" "}
          <a
            className="font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2"
            href="#"
          >
            Ticket Policies
          </a>
          .
        </label>
      </div>

      {/* CTA */}
      <button
        className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-black active:scale-[0.99] transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
        type="submit"
      >
        <span>Create Account &amp; Register</span>
        <svg
          className="w-4 h-4 transform group-hover:translate-x-0.5 transition"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M14 5l7 7m0 0l-7 7m7-7H3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}