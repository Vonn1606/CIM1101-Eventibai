"use client";

import React, { useState, useMemo } from "react";
import EventsNavbar from "@/component/dashboard/events/eventsnavbar";
import FeaturedCarousel from "@/component/dashboard/featuredeventhero";
import EventGridCard from "@/component/dashboard/events/eventgridcard";
import SortSelect, { type SortOption } from "@/component/dashboard/events/sortselect";
import type { EventDetail, FeaturedEvent, CampusEvent } from "@/types/events";
import Footer from "@/component/footer";

// The 4 colleges from the DB schema
const COLLEGE_PILLS = [
  { id: "eng", label: "Engineering" },
  { id: "sci", label: "Arts & Science" },
  { id: "biz", label: "Business" },
  { id: "art", label: "Design" },
] as const;

type CollegeSlug = "eng" | "sci" | "biz" | "art";

interface EventsClientProps {
  initialEvents: (CampusEvent | EventDetail)[];
  featuredEvents?: FeaturedEvent[];
}

export default function EventsClient({ initialEvents, featuredEvents = [] }: EventsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCollege, setActiveCollege] = useState<CollegeSlug | "all">("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "this-week" | "this-month">("all");
  const [sortOption, setSortOption] = useState<SortOption>("date");

  // Extract unique categories from initial events
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialEvents.forEach((e) => {
      const cat = ("category" in e && e.category) || ("tag" in e && e.tag);
      if (cat && typeof cat === "string" && cat.trim()) {
        set.add(cat.trim());
      }
    });
    return Array.from(set);
  }, [initialEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let list = [...initialEvents];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          ("org" in e && (e.org as string).toLowerCase().includes(q)) ||
          (("summary" in e && typeof e.summary === "string") ? e.summary.toLowerCase().includes(q) : false) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    // Filter by college slug (department field on CampusEvent)
    if (activeCollege !== "all") {
      list = list.filter((e) => {
        const dept = (e as CampusEvent).department;
        return dept === activeCollege;
      });
    }

    // Filter by category
    if (activeCategory !== "all") {
      list = list.filter((e) => {
        const cat = ("category" in e && e.category) || ("tag" in e && e.tag);
        return cat === activeCategory;
      });
    }

    // Filter by date range (This Week / This Month)
    if (dateFilter !== "all") {
      const now = new Date();
      list = list.filter((e) => {
        const startStr = ("startsAt" in e && e.startsAt) || ("date" in e && e.date);
        if (!startStr) return true;
        const evDate = new Date(startStr);
        if (isNaN(evDate.getTime())) return true;

        if (dateFilter === "this-week") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);

          return evDate >= startOfWeek && evDate <= endOfWeek;
        }

        if (dateFilter === "this-month") {
          return (
            evDate.getFullYear() === now.getFullYear() &&
            evDate.getMonth() === now.getMonth()
          );
        }

        return true;
      });
    }

    // Sort
    if (sortOption === "seats") {
      list.sort((a, b) => b.seatsLeft - a.seatsLeft);
    } else if (sortOption === "popular") {
      list.sort((a, b) => {
        const capA = ("totalCapacity" in a ? a.totalCapacity : 0) || 1;
        const capB = ("totalCapacity" in b ? b.totalCapacity : 0) || 1;
        const regA = ("registeredCount" in a ? a.registeredCount : 0) || 0;
        const regB = ("registeredCount" in b ? b.registeredCount : 0) || 0;
        return regB / capB - regA / capA;
      });
    }
    // default: date — already sorted by server

    return list;
  }, [initialEvents, searchQuery, activeCollege, activeCategory, dateFilter, sortOption]);

  return (
    <div className="min-h-screen bg-[#F9F9FC] flex flex-col justify-between">
      <div>
        <EventsNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 sm:px-6 pt-5 pb-16">
          {/* Featured Carousel Hero */}
          <FeaturedCarousel events={featuredEvents} />

          {/* Filter Pills */}
          <div className="flex flex-col gap-3 border-b border-neutral-200/60 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
                  College:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCollege("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    activeCollege === "all"
                      ? "bg-[#6c0c28] text-white shadow-sm"
                      : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60"
                  }`}
                >
                  All Colleges
                </button>
                {COLLEGE_PILLS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActiveCollege(d.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                      activeCollege === d.id
                        ? "bg-[#6c0c28] text-white shadow-sm"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <SortSelect value={sortOption} onChange={setSortOption} />
            </div>

            {/* Additional Discovery Filters: Category & Date Range */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
                  When:
                </span>
                {(["all", "this-week", "this-month"] as const).map((df) => (
                  <button
                    key={df}
                    type="button"
                    onClick={() => setDateFilter(df)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      dateFilter === df
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {df === "all" ? "Any Date" : df === "this-week" ? "This Week" : "This Month"}
                  </button>
                ))}
              </div>

              {categories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Category:
                  </span>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Events Count and Results Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">
              All Campus Events
            </h1>
            <span className="text-xs font-semibold text-neutral-500">
              Showing {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Grid of Events */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => (
                <EventGridCard key={evt.id} event={evt as EventDetail} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <p className="text-base font-bold text-neutral-800">
                No events matched your search or filter.
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Try clearing the search box or selecting &ldquo;All Colleges&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCollege("all");
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-[#6c0c28] text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
