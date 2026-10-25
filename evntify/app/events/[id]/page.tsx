import type { Metadata } from "next";
import { Suspense } from "react";
import { getEventDetail, getAllEvents } from "@/lib/events";
import EventDetailsClient from "./event-details-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  const events = getAllEvents();
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = getEventDetail(id);

  return {
    title: `${event.title} | Eventify UE`,
    description: event.summary,
  };
}

async function EventDetailsContent({ params }: PageProps) {
  const { id } = await params;
  const event = getEventDetail(id);
  return <EventDetailsClient initialEvent={event} />;
}

export default function EventPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9fc] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c0c28] border-t-transparent" />
        </div>
      }
    >
      <EventDetailsContent params={params} />
    </Suspense>
  );
}
