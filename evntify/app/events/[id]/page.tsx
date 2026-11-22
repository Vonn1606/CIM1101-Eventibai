import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug as fetchEventBySlug } from "@/lib/db/events";
import EventDetailsClient from "./event-details-client";
import { createClient } from "@/lib/supabase/server";
import type { InitialRegistration, PrefillData } from "./event-details-client";

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

  let prefill: PrefillData | null = null;

  if (user) {
    const targetEventId = event.dbId ?? event.id;
    const [regRes, profileRes] = await Promise.all([
      supabase
        .from("registrations")
        .select("ticket_code, status")
        .eq("event_id", targetEventId)
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .maybeSingle(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("profiles")
        .select("full_name, email, student_number, colleges ( slug )")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (regRes.data) {
      initialRegistration = {
        isRegistered: true,
        ticketCode: regRes.data.status === "waitlisted" ? "" : regRes.data.ticket_code,
        status: regRes.data.status === "waitlisted" ? "waitlisted" : "registered",
      };
    }

    if (profileRes.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = profileRes.data as any;
      prefill = {
        fullName: p.full_name ?? "",
        email: p.email ?? user.email ?? "",
        studentNumber: p.student_number ?? "",
        collegeSlug: p.colleges?.slug ?? "",
      };
    }
  }

  return (
    <EventDetailsClient
      initialEvent={event}
      initialRegistration={initialRegistration}
      prefill={prefill}
    />
  );
}
