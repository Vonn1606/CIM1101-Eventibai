import type { Metadata } from "next";
import { getAllEvents } from "@/lib/events";
import EventsClient from "./events-client";

export const metadata: Metadata = {
  title: "Campus Events | Eventify UE",
  description: "Browse and discover upcoming campus talks, concerts, sports, and student activities.",
};

export default function EventsPage() {
  const events = getAllEvents();
  return <EventsClient initialEvents={events} />;
}
