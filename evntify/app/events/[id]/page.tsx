import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getAllEventSlugs } from "@/lib/db/events";
import EventDetailsClient from "./event-details-client";
import { createClient } from "@/lib/supabase/server";
import type { InitialRegistration } from "./event-details-client";
interface PageProps {
  params: Promise<{ id: string }>;
}

// Pre-build known slugs; new events are rendered dynamically
export async function generateStaticParams() {
  try {
    const slugs = await getAllEventSlugs();
    if (slugs.length === 0) {
      return [{ id: "_" }];
    }
    return slugs.map((id) => ({ id }));
  } catch {
    return [{ id: "_" }];
  }
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
    const { data } = await supabase
      .from("registrations")
      .select("ticket_code, status")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .neq("status", "cancelled")
      .maybeSingle();

    const row = data as unknown as { ticket_code: string; status: string } | null;
    if (row) {
      initialRegistration = {
        isRegistered: true,
        ticketCode: row.ticket_code,
        status: row.status === "waitlisted" ? "waitlisted" : "registered",
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
