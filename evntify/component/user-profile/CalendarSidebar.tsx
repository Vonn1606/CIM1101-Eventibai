"use client";

import { useState } from "react";
import CalendarCard from "@/component/user-profile/CalendarCard";
import SelectedDayPreview, { SelectedDayEventItem } from "@/component/user-profile/SelectedDayPreview";

interface CalendarSidebarProps {
  monthLabel: string;
  prevTail: number[];
  days: number;
  featured: number;
  registered: number[];
  openEvents?: number[];
  prevHref?: string;
  nextHref?: string;
  todayHref?: string;
  /** Map of day-of-month → event info for the preview */
  dayEvents: Record<number, SelectedDayEventItem>;
}

export default function CalendarSidebar({
  monthLabel,
  prevTail,
  days,
  featured,
  registered,
  openEvents = [],
  prevHref,
  nextHref,
  todayHref,
  dayEvents,
}: CalendarSidebarProps) {
  const [prevMonth, setPrevMonth] = useState(monthLabel);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Reset selected day whenever monthLabel changes
  if (prevMonth !== monthLabel) {
    setPrevMonth(monthLabel);
    setSelectedDay(null);
  }

  const selectedEvent = selectedDay != null ? (dayEvents[selectedDay] ?? null) : null;

  return (
    <>
      <CalendarCard
        monthLabel={monthLabel}
        prevTail={prevTail}
        days={days}
        featured={featured}
        registered={registered}
        openEvents={openEvents}
        selectedDay={selectedDay}
        onDayClick={setSelectedDay}
        prevHref={prevHref}
        nextHref={nextHref}
        todayHref={todayHref}
      />
      <SelectedDayPreview event={selectedEvent} />
    </>
  );
}
