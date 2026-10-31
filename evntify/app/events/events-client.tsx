"use client";

import React, { useState, useMemo } from "react";
import EventsNavbar from "@/component/dashboard/events/eventsnavbar";
import DepartmentPills from "@/component/dashboard/events/departmentpills";
import FeaturedCarousel from "@/component/dashboard/featuredeventhero";
import EventGridCard from "@/component/dashboard/events/eventgridcard";
import SortSelect, { type SortOption } from "@/component/dashboard/events/sortselect";
import type { EventDetail, FeaturedEvent } from "@/types/events";
import type { DepartmentId } from "@/lib/department";
import { featuredEvents as defaultFeaturedEvents } from "@/lib/events";
import Footer from "@/component/footer";

interface EventsClientProps {
  initialEvents: EventDetail[];
  featuredEvents?: FeaturedEvent[];
}

export default function EventsClient({ initialEvents, featuredEvents = defaultFeaturedEvents }: EventsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDept, setActiveDept] = useState<DepartmentId | "all">("all");
  const [sortOption, setSortOption] = useState<SortOption>("date");

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let list = [...initialEvents];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.org.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    // Filter by department
    if (activeDept !== "all") {
      const deptMap: Record<DepartmentId, string> = {
        eng: "Engineering",
        cs: "Computer Studies",
        biz: "Business",
        arts: "Arts",
        med: "Health",
        law: "Law",
      };
      const key = deptMap[activeDept]?.toLowerCase();
      if (key) {
        list = list.filter(
          (e) =>
            e.orgDept.toLowerCase().includes(key) ||
            e.category.toLowerCase().includes(key) ||
            e.summary.toLowerCase().includes(key)
        );
      }
    }

    // Sort
    if (sortOption === "seats") {
      list.sort((a, b) => b.seatsLeft - a.seatsLeft);
    } else if (sortOption === "popular") {
      list.sort((a, b) => {
        const pctA = a.registeredCount / a.totalCapacity;
        const pctB = b.registeredCount / b.totalCapacity;
        return pctB - pctA;
      });
    }

    return list;
  }, [initialEvents, searchQuery, activeDept, sortOption]);

  return (
    <div className="min-h-screen bg-[#F9F9FC] flex flex-col justify-between">
      <div>
        <EventsNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 sm:px-6 pt-5 pb-16">
          {/* Featured Carousel Hero */}
          <FeaturedCarousel events={featuredEvents} />

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/60 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
                College:
              </span>
              <button
                type="button"
                onClick={() => setActiveDept("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  activeDept === "all"
                    ? "bg-[#6c0c28] text-white shadow-sm"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60"
                }`}
              >
                All Colleges
              </button>
              {(
                [
                  { id: "cs", label: "Computer Studies" },
                  { id: "biz", label: "Business & Accountancy" },
                  { id: "eng", label: "Engineering" },
                  { id: "arts", label: "Arts & Sciences" },
                  { id: "med", label: "Health Sciences" },
                  { id: "law", label: "Law" },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDept(d.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    activeDept === d.id
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
                <EventGridCard key={evt.id} event={evt} />
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
                  setActiveDept("all");
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
