import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/db/events";
import EventDetailsClient from "./event-details-client";
import { createClient } from "@/lib/supabase/server";
import type { InitialRegistration } from "./event-details-client";
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
  const event = await getEventBySlug(id);

  if (!event) notFound();

  const supabase = await createClient();
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
        ticketCode: data.ticket_code,
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
