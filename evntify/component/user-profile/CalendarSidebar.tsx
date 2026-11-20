"use client";

import { useState } from "react";
import CalendarCard from "@/component/user-profile/CalendarCard";
import SelectedDayPreview from "@/component/user-profile/SelectedDayPreview";

interface CalendarSidebarProps {
  monthLabel: string;
  prevTail: number[];
  days: number;
  featured: number;
  registered: number[];
  /** Map of day-of-month → event info for the preview */
  dayEvents: Record<
    number,
    {
      date: string;
      title: string;
      time: string;
      venue: string;
      ticketCode: string;
    }
  >;
}

export default function CalendarSidebar({
  monthLabel,
  prevTail,
  days,
  featured,
  registered,
  dayEvents,
}: CalendarSidebarProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const selectedEvent = selectedDay != null ? (dayEvents[selectedDay] ?? null) : null;

  return (
    <>
      <CalendarCard
        monthLabel={monthLabel}
        prevTail={prevTail}
        days={days}
        featured={featured}
        registered={registered}
        selectedDay={selectedDay}
        onDayClick={setSelectedDay}
      />
      <SelectedDayPreview event={selectedEvent} />
    </>
  );
}
