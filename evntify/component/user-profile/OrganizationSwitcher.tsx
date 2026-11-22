"use client";

import { useState, useTransition } from "react";
import { Building2, Check, RefreshCw } from "lucide-react";
import { setActiveOrganization } from "@/app/actions/organization";
import type { UserOrganization } from "@/lib/db/active-org";

interface OrganizationSwitcherProps {
  organizations: UserOrganization[];
  activeOrgId?: string | null;
}

export default function OrganizationSwitcher({
  organizations,
  activeOrgId: initialActiveOrgId,
}: OrganizationSwitcherProps) {
  const [activeId, setActiveId] = useState<string | null>(
    initialActiveOrgId || (organizations[0]?.id ?? null)
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Single-org users see no switcher
  if (!organizations || organizations.length < 2) {
    return null;
  }

  const handleSelect = (orgId: string, orgName: string) => {
    if (orgId === activeId || isPending) return;

    setActiveId(orgId);
    setFeedback(`Switching to ${orgName}...`);

    startTransition(async () => {
      const res = await setActiveOrganization(orgId);
      if (res.error) {
        setFeedback(`Failed: ${res.error}`);
      } else {
        setFeedback(`Active: ${orgName}`);
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#ECE2DC] bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#FAF2EE] text-[#651C32]">
            <Building2 size={16} />
          </span>
          <div>
            <h4 className="text-xs font-bold text-[#1E1B19]">Active Student Organization</h4>
            <p className="text-[11px] text-[#7E6E6A]">Select which council or club you represent</p>
          </div>
        </div>
        {feedback && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#006D43] bg-[#E8F8F0] px-2.5 py-0.5 rounded-full">
            {isPending && <RefreshCw size={11} className="animate-spin" />}
            {feedback}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {organizations.map((org) => {
          const isActive = org.id === activeId;
          return (
            <button
              key={org.id}
              type="button"
              onClick={() => handleSelect(org.id, org.name)}
              disabled={isPending}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                isActive
                  ? "border-[#651C32] bg-[#FAF2EE] text-[#400013] shadow-xs"
                  : "border-[#ECE2DC] bg-[#FCFBF9] text-neutral-700 hover:bg-[#FAF5F2]"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold">{org.name}</span>
                <span className="text-[11px] text-[#7E6E6A]">{org.position}</span>
              </div>
              {isActive && (
                <span className="flex size-5 items-center justify-center rounded-full bg-[#651C32] text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
