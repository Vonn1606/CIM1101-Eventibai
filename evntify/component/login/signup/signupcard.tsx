import SignUpForm from "./signupform";

export default function SignUpCard() {
  return (
    <div className="w-full max-w-[450px] bg-white rounded-3xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] px-7 py-9 sm:px-9 sm:py-11">
      {/* Star Icon Badge */}
      <div className="flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-full bg-[#FCECEF] text-[#8B1E3F] mb-3 flex items-center justify-center">
          <svg
            className="w-5 h-5 fill-[#8B1E3F]"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-[26px] font-bold text-neutral-900 tracking-tight">
          Create Your Account
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-xs text-neutral-500 leading-relaxed max-w-[320px]">
          Join the campus event community. Discover and attend upcoming talks, seminar, and wonderful events that will help you in your academic years!
        </p>
      </div>

      <SignUpForm />
    </div>
  );
}
