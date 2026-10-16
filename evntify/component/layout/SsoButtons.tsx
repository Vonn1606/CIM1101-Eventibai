const buttonClass =
  "w-full py-2.5 px-3 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow transition flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-rose-400/20";
const iconClass =
  "w-4 h-4 transform group-hover:scale-110 transition duration-150";

export default function SsoButtons() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3" data-purpose="sso-options">
      {/* Google Workspace */}
      <button
        className={buttonClass}
        title="Sign up with Google Workspace"
        type="button"
      >
        <svg className={iconClass} viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
      </button>

      {/* Microsoft 365 */}
      <button
        className={buttonClass}
        title="Sign up with Microsoft 365"
        type="button"
      >
        <svg className={iconClass} viewBox="0 0 23 23">
          <path d="M1 1h10v10H1z" fill="#f35325" />
          <path d="M12 1h10v10H12z" fill="#81bc06" />
          <path d="M1 12h10v10H1z" fill="#05a6f0" />
          <path d="M12 12h10v10H12z" fill="#ffba08" />
        </svg>
      </button>

      {/* Apple ID */}
      <button
        className={buttonClass}
        title="Sign up with Apple ID"
        type="button"
      >
        <svg
          className={`${iconClass} text-slate-800 fill-current`}
          viewBox="0 0 170 170"
        >
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.66-7.8-11.91-14.29-5.8-8.89-10.36-19.14-13.68-30.74-3.32-11.61-4.98-22.39-4.98-32.35 0-14.13 3.69-25.79 11.07-34.98 7.38-9.18 16.58-13.88 27.6-14.09 5.37 0 11.19 1.58 17.46 4.73 6.27 3.16 10.15 4.79 11.65 4.89 1.25-.1 5.38-1.79 12.39-5.06 7.01-3.27 13.06-4.7 18.15-4.29 13.78 1.1 24.63 6.59 32.55 16.48-12.08 7.33-17.98 17.2-17.7 29.62.28 9.94 4.14 18.25 11.59 24.94 7.45 6.69 16.48 10.45 27.09 11.28-2.61 7.82-5.74 15.14-9.39 21.96zM119.22 33.15c0-7.27 2.66-13.97 7.98-20.1 5.32-6.13 11.9-10.11 19.74-11.94-.14 1.77-.42 3.55-.84 5.34-.84 3.73-2.31 7.42-4.41 11.07-3.78 6.43-8.86 11.09-15.24 13.98-2.38 1.09-4.79 1.64-7.23 1.65z" />
        </svg>
      </button>
    </div>
  );
}