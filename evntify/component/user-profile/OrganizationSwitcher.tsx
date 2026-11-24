"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, MoreVertical, RefreshCw } from "lucide-react";
import { setActiveOrganization } from "@/app/actions/organization";
import type { UserOrganization } from "@/lib/db/active-org";

interface OrganizationSwitcherProps {
  organizations: UserOrganization[];
  activeOrgId?: string | null;
}

const BANNER_GRADIENTS = [
  "from-[#5E1224] to-[#4A0E1C]",
  "from-[#8B4513] to-[#A0522D]",
  "from-[#1A365D] to-[#2A4365]",
  "from-[#1B4332] to-[#2D6A4F]",
  "from-[#4C1D95] to-[#5B21B6]",
  "from-[#312E81] to-[#3730A3]",
];

function getOrgAcronym(org: UserOrganization): string {
  if (org.shortName?.trim()) return org.shortName.trim().toUpperCase();
  if (org.initials?.trim()) return org.initials.trim().toUpperCase();
  const words = org.name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  const filtered = words.filter(
    (w) => !["of", "and", "the", "in", "for", "at", "&"].includes(w.toLowerCase())
  );
  return (filtered.length > 0 ? filtered : words)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 8);
}

function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based: 0 = Jan, 6 = July
  const startYear = month >= 6 ? year : year - 1;
  return `Academic Year ${startYear}–${startYear + 1}`;
}

export default function OrganizationSwitcher({
  organizations,
  activeOrgId: initialActiveOrgId,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(
    initialActiveOrgId || (organizations[0]?.id ?? null)
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!organizations || organizations.length === 0) {
    return null;
  }

  const handleSelectAndNavigate = (orgId: string, orgName: string) => {
    if (isPending) return;

    setActiveId(orgId);
    setFeedback(`Opening ${orgName}...`);

    startTransition(async () => {
      const res = await setActiveOrganization(orgId);
      if (res?.error) {
        setFeedback(`Failed: ${res.error}`);
      } else {
        router.push("/organizer-dashboard");
      }
    });
  };

  const academicYear = getCurrentAcademicYear();

  return (
    <section className="flex flex-col gap-3" aria-labelledby="active-org-heading">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#FAF2EE] text-[#651C32]">
            <Building2 size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="active-org-heading" className="text-base font-bold text-[#1E1B19]">
                Active Student Organization
              </h3>
              <span className="rounded-full bg-[#F2ECE8] px-2.5 py-0.5 text-xs font-semibold text-[#7E6E6A]">
                {organizations.length} Workspaces
              </span>
            </div>
            <p className="text-xs text-[#7E6E6A] mt-0.5">
              Choose a council or club card to switch your active event dashboard
            </p>
          </div>
        </div>

        {feedback && (
          <span className="self-start sm:self-center flex items-center gap-1.5 text-xs font-semibold text-[#006D43] bg-[#E8F8F0] px-3 py-1 rounded-full">
            {isPending && <RefreshCw size={12} className="animate-spin" />}
            {feedback}
          </span>
        )}
      </div>

      {/* 2. Workspace Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {organizations.map((org, index) => {
          const isActive = org.id === activeId;
          const acronym = getOrgAcronym(org);
          const gradient = BANNER_GRADIENTS[index % BANNER_GRADIENTS.length];
          const category = org.deptLabel || org.collegeName || org.category || "Student Organization";
          const memberCount = org.memberCount ?? 1;
          const upcomingCount = org.upcomingEventsCount ?? 0;

          return (
            <div
              key={org.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden transition ${
                isActive ? "border-[#651C32]/40" : "border-[#ECE2DC]"
              }`}
            >
              {/* Card Top: Banner */}
              <div>
                <div
                  className={`relative h-[100px] w-full p-3.5 flex flex-col justify-between overflow-hidden bg-gradient-to-r ${gradient}`}
                >
                  {/* Top Bar: Pill (Top-Left) and Menu Icon (Top-Right) */}
                  <div className="flex items-center justify-between z-10 gap-2">
                    <div className="flex items-center gap-1.5 max-w-[85%] min-w-0">
                      <span className="bg-black/35 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full truncate">
                        {acronym} • {org.position || "Member"}
                      </span>
                      {isActive && (
                        <span className="bg-white/25 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-white/80 hover:text-white transition p-1 shrink-0">
                      <MoreVertical size={16} />
                    </span>
                  </div>

                  {/* Watermark (Background) */}
                  <span className="absolute -bottom-1 right-2 text-white/10 text-5xl font-black select-none pointer-events-none tracking-tight leading-none uppercase">
                    {acronym}
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-4 pt-1 pb-1">
                  <h4 className="text-[#1E1B19] font-bold text-base line-clamp-1 mt-3">
                    {org.name}
                  </h4>
                  <p className="text-xs text-[#7E6E6A] font-medium mt-1">
                    {category} • {memberCount} {memberCount === 1 ? "Member" : "Members"}
                  </p>
                  <p className="text-xs text-[#7E6E6A] font-medium mt-0.5">
                    {upcomingCount} {upcomingCount === 1 ? "Upcoming Event" : "Upcoming Events"} • {academicYear}
                  </p>
                </div>
              </div>

              {/* Card Footer / Action Button */}
              <div className="mt-4 border-t border-[#ECE2DC]">
                <button
                  type="button"
                  onClick={() => handleSelectAndNavigate(org.id, org.name)}
                  disabled={isPending}
                  className="w-full text-[#651C32] font-semibold text-xs flex items-center justify-center gap-1.5 py-3 hover:text-[#4A0E1C] hover:bg-[#FAF5F2] transition cursor-pointer disabled:opacity-50"
                >
                  {isPending && activeId === org.id ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Opening Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <span>Open Organization Dashboard</span>
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
