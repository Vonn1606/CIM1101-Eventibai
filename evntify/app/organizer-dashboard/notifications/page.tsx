"use client";

import Image from "next/image";
import Link from "next/link";
import OrgNotificationsFeed from "@/component/organizer/notifications/NotificationsFeed";
import {
  INITIAL_FRESH,
  INITIAL_EARLIER,
} from "@/component/organizer/notifications/notifications-data";
import "./organizer-notifications.css";

export default function OrganizerNotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1B19] font-sans org-notif-root">
      {/* Top Header bar with Eventify logo - exactly matching admin notification page */}
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

      {/* Main Content Area - exactly copying position of admin notification page */}
      <main className="flex-1 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-[760px] flex flex-col gap-6">
          <OrgNotificationsFeed
            initialFresh={INITIAL_FRESH}
            initialEarlier={INITIAL_EARLIER}
          />
        </div>
      </main>

      {/* Footer matching admin notification page */}
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
