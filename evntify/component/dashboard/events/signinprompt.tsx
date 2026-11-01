"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Lock, ArrowRight } from "lucide-react";

export default function SignInPrompt({
    open,
    onClose,
    nextPath,
}: {
    open: boolean;
    onClose: () => void;
    nextPath?: string; // where to return after auth
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const q = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-prompt-title"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-1.5 bg-gradient-to-r from-[#6c0c28] via-[#8b263e] to-[#006d43]" />

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3.5 top-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <div className="p-6 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FCECEF] text-[#6c0c28]">
                        <Lock size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c0c28]">
                        Account Required
                    </span>
                    <h2 id="signin-prompt-title" className="mt-1 text-xl font-bold text-neutral-900">
                        Not signed in yet?
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 max-w-[280px]">
                        Sign in or create an account to register for events and claim your Campus Fast-Pass.
                    </p>

                    <div className="mt-5 flex w-full flex-col gap-2">
                        <Link
                            href={`/signin${q}`}
                            className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#6c0c28] text-xs font-bold !text-white shadow-sm transition hover:bg-[#8b263e]"
                        >
                            Sign In <ArrowRight size={13} />
                        </Link>
                        <Link
                            href={`/signup${q}`}
                            className="flex h-10 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-700 transition hover:bg-neutral-200"
                        >
                            Create an Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}