import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/component/layout/site-header";
import SiteFooter from "@/component/layout/site-footer";

export const metadata: Metadata = {
  title: "Eventify Policies | Privacy & Terms",
  description: "Privacy, data handling, and terms of use for Eventify.",
};

export default function PoliciesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
      <SiteHeader variant="public" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <span className="inline-block rounded-full bg-[#6c0c28]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6c0c28]">
          Eventify Legal
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-neutral-900">
          Eventify Policies
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          How Eventify collects, uses, and protects your campus event and attendance information.
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-neutral-900">1. Data We Collect</h2>
            <p className="mt-2">
              Eventify stores your name, UE email address, student number, college affiliation, event registrations, and check-in timestamps strictly for campus event coordination and attendance verification.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-neutral-900">2. Access &amp; Confidentiality</h2>
            <p className="mt-2">
              Registration rosters are accessible only to authorized organizers of the specific event and the Office of Student Affairs. Data is never sold or shared with external third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-neutral-900">3. Enforcement &amp; Suspension</h2>
            <p className="mt-2">
              Accounts or organizations found misusing registrations, falsifying event details, or violating the UE Student Manual may be suspended by campus administrators.
            </p>
          </section>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs font-semibold">
          <Link href="/guidelines" className="text-[#6c0c28] hover:underline">
            Read Eventify Guidelines →
          </Link>
          <Link href="/signup" className="text-neutral-600 hover:underline">
            Back to Sign Up
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
