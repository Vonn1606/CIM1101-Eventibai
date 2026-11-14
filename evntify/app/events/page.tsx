import type { Metadata } from "next";
import { getEvents, getFeaturedEvents } from "@/lib/db/events";
import EventsClient from "./events-client";

export const metadata: Metadata = {
  title: "Eventify - Dashboard",
  description: "Browse and discover upcoming campus talks, concerts, sports, and student activities.",
};

export default async function EventsPage() {
  const [events, featuredEvents] = await Promise.all([getEvents(), getFeaturedEvents()]);
  return <EventsClient initialEvents={events} featuredEvents={featuredEvents} />;
}
