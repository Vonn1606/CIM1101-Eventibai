import SignUpForm from "./signupform";

import SsoButtons from "../layout/SsoButtons";



export default function SignUpCard() {

  return (

    <div className="relative w-full max-w-lg">

      {/* Decorative glow behind card */}

      <div className="absolute -inset-1.5 bg-gradient-to-r from-rose-200/50 via-pink-100/50 to-indigo-100/50 rounded-[32px] blur-xl opacity-70 transform -rotate-1 pointer-events-none" />

      {/* Frosted glass card */}
      <div className="relative backdrop-blur-xl bg-white/85 border border-white/90 shadow-glass rounded-3xl p-7 sm:p-9 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-rose-50 to-rose-100/80 border border-rose-200/70 text-rose-600 shadow-sm mb-3 flex items-center justify-center transform transition hover:scale-105 duration-200">
            <img
              src="/eventify-logo.svg"
              alt="Icon"
              className="w-7 h-7"
            />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="mt-1.5 text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-xs">
            Join the campus event community. Discover and reserve tickets for
            upcoming talks, concerts, and hackathons.
          </p>
        </div>

        <SignUpForm />

        {/* SSO divider */}
        <div className="mt-6 relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center"
          >
            <div className="w-full border-t border-slate-200/80" />
          </div>
          <div className="relative flex justify-center text-[11px] text-slate-500 uppercase tracking-wider">
            <span className="bg-white/95 px-3 rounded-full text-slate-400 font-medium">
              Or sign up with campus SSO
            </span>
          </div>
        </div>

        <SsoButtons />

        <p className="mt-6 text-center text-xs text-slate-500">
          Already registered for events?
          <a
            className="font-bold text-slate-800 hover:text-rose-600 transition ml-1 underline underline-offset-4 decoration-rose-300"
            href="#signin"
          >
            Sign In here
          </a>
        </p>
      </div>
    </div>
  );
}