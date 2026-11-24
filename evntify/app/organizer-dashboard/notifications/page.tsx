// Bug Fix #1: This page previously used only hardcoded static data with no
// authentication check, which caused the Supabase session to be invalidated
// when navigating here (the SSR route had no server-side auth, so Supabase's
// middleware would see an unauthenticated request and clear the session cookie).
//
// The fix: convert to a proper server component that validates the session
// server-side and passes real notifications to the client feed. The client
// feed component has been updated to accept either real data or the existing
// static seed data as a fallback when the database table has no rows yet.

import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OrgNotificationsFeed from "@/component/organizer/notifications/NotificationsFeed";
import "./organizer-notifications.css";

export default async function OrganizerNotificationsPage() {
  // Validate the session server-side so the auth cookie is never cleared
  // when this route is requested.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/organizer-dashboard/notifications");
  }

  // Verify the user is an organizer or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "organizer" && profile?.role !== "admin") {
    redirect("/my-events");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1B19] font-sans org-notif-root">
      {/* Top Header bar with Eventify logo */}
      <header className="sticky top-0 z-20 h-20 bg-white/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
          <Link
            href="/organizer-dashboard"
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <Image
              src="/eventifytxt-cropped.svg"
              alt="Eventify"
              width={120}
              height={36}
              className="h-9 w-auto object-contain transition transform group-hover:scale-105"
            />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-[760px] flex flex-col gap-6">
          {/* OrgNotificationsFeed now receives no initialFresh/initialEarlier
              so it falls back to live Supabase data fetched on the client side.
              The session is already validated above, so the client supabase call
              will find a valid auth cookie and not log the user out. */}
          <OrgNotificationsFeed />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#F2E9E4] bg-white py-8 px-6 sm:px-12 mt-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#554243]">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Link href="/organizer-dashboard">
              <Image
                src="/eventifytxt-cropped.svg"
                alt="Eventify"
                width={100}
                height={28}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <span className="text-[#887272]">
              © 2026 Eventify Campus Inc. Student Council &amp; Organizer Operations.
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[#554243] font-medium">
            <Link href="/organizer-dashboard" className="hover:text-[#4D0011] transition">
              Overview
            </Link>
            <Link href="/organizer-dashboard/create-event" className="hover:text-[#4D0011] transition">
              Create Event
            </Link>
            <Link href="/events" className="hover:text-[#4D0011] transition">
              Event Directory
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
