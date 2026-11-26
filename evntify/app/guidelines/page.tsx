import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/component/layout/site-header";
import SiteFooter from "@/component/layout/site-footer";

export const metadata: Metadata = {
  title: "Eventify Guidelines | Campus Event Rules",
  description: "Official student and organizer guidelines for using Eventify at the University of the East.",
};

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
      <SiteHeader variant="public" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <span className="inline-block rounded-full bg-[#6c0c28]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6c0c28]">
          Eventify Campus
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-neutral-900">
          Eventify Guidelines
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          These guidelines govern student participation, event registration, and organizer conduct on Eventify.
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-neutral-900">1. Student Registration &amp; Fast-Pass</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>Students must register using their official <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">@ue.edu.ph</code> account and accurate student number.</li>
              <li>Each Digital Fast-Pass QR code is personal and non-transferable.</li>
              <li>If you can no longer attend an event, cancel your registration promptly so waitlisted students can be promoted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-neutral-900">2. Campus Venue &amp; Attendance Conduct</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>Arrive at least 15–30 minutes before the event start time for gate check-in.</li>
              <li>Follow all University of the East Student Manual standards and venue marshal instructions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-neutral-900">3. Organizer Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>Submit event proposals at least 7 days in advance with accurate venue capacity and college affiliation.</li>
              <li>All events require Office of Student Affairs approval before opening to students.</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs font-semibold">
          <Link href="/policies" className="text-[#6c0c28] hover:underline">
            Read Eventify Policies →
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
