import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug as fetchEventBySlug } from "@/lib/db/events";
import EventDetailsClient from "./event-details-client";
import { createClient } from "@/lib/supabase/server";
import type { InitialRegistration } from "./event-details-client";

// Deduplicate event fetch across generateMetadata and EventPage
const getEventBySlug = cache(async (slug: string) => {
  return fetchEventBySlug(slug);
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventBySlug(id);
  if (!event) return { title: "Event Not Found | Eventify UE" };

  return {
    title: `${event.title} | Eventify UE`,
    description: event.summary,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;

  // Run event query and auth check concurrently
  const supabasePromise = createClient();
  const [event, supabase] = await Promise.all([
    getEventBySlug(id),
    supabasePromise,
  ]);

  if (!event) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialRegistration: InitialRegistration = {
    isRegistered: false,
    ticketCode: "",
    status: null,
  };

  if (user) {
    const targetEventId = event.dbId ?? event.id;
    const { data } = await supabase
      .from("registrations")
      .select("ticket_code, status")
      .eq("event_id", targetEventId)
      .eq("user_id", user.id)
      .neq("status", "cancelled")
      .maybeSingle();

    if (data) {
      initialRegistration = {
        isRegistered: true,
        // Waitlisted users do NOT get a QR ticket code — they have no confirmed seat.
        ticketCode: data.status === "waitlisted" ? "" : data.ticket_code,
        status: data.status === "waitlisted" ? "waitlisted" : "registered",
      };
    }
  }

  return (
    <EventDetailsClient
      initialEvent={event}
      initialRegistration={initialRegistration}
    />
  );
}
