"use client";

import React from "react";
import { ArrowDownUp } from "lucide-react";

export type SortOption = "date" | "seats" | "popular";

export default function SortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (val: SortOption) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
        <ArrowDownUp size={12} />
        Sort:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6c0c28]/20"
      >
        <option value="date">Date (Upcoming First)</option>
        <option value="seats">Available Slots (Most to Least)</option>
        <option value="popular">Popularity (% Filled)</option>
      </select>
    </div>
  );
}
