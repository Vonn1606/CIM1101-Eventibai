"use client";

import { useState } from "react";
import { UserPlus, Sparkles, Clock, X, AlertCircle } from "lucide-react";
import { submitOrganizerApplication } from "@/app/actions/organizer-application";

interface ApplyOrganizerSectionProps {
  existingApplication?: {
    org_name: string;
    position: string;
    department?: string | null;
    status: string;
    created_at: string;
    admin_notes?: string | null;
  } | null;
  userRole?: string;
  allOrganizations?: Array<{ id: string; name: string; short_name?: string | null }>;
  defaultCollege?: string;
}

export default function ApplyOrganizerSection({
  existingApplication,
  userRole,
  allOrganizations = [],
  defaultCollege = "",
}: ApplyOrganizerSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(undefined);
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState(defaultCollege);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    const trimmed = val.trim().toLowerCase();
    const matched = allOrganizations.find(
      (o) =>
        o.name.toLowerCase() === trimmed ||
        (o.short_name && o.short_name.toLowerCase() === trimmed)
    );
    setSelectedOrgId(matched?.id);
  };

  // Feature: Persistent "Apply as Organizer" — organizers/admins see their status
  // banner but are NOT blocked from applying to join additional organizations.
  // The early-return has been replaced with a conditional banner rendered inline
  // above the apply form, so existing organizers can still submit new applications.
  const isPrivilegedUser = userRole === "organizer" || userRole === "admin";

  // If there's an existing pending application
  if (existingApplication?.status === "pending" || success) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2.5 text-amber-800">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">Organizer Application Under Review</h3>
            <p className="text-xs text-amber-700">
              Your application for <span className="font-semibold">{existingApplication?.org_name || orgName}</span> ({existingApplication?.position || position}) is currently awaiting review by campus administration.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-200/80 px-3 py-1 text-xs font-bold text-amber-900 shrink-0">
          Pending Approval
        </span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await submitOrganizerApplication({
      organizationId: selectedOrgId,
      orgName,
      position,
      department: defaultCollege || department,
      reason,
    });
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setModalOpen(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-[#ECE5DF] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl bg-[#FCECEF] p-3 text-[#8C233C] shrink-0">
            <UserPlus size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1E1B19]">
                {isPrivilegedUser ? "Join Another Organization?" : "Lead an Organization or Event?"}
              </h3>
              <span className="rounded-full bg-[#FCECEF] px-2 py-0.5 text-[10px] font-bold text-[#8C233C]">
                Student Councils &amp; Orgs
              </span>
            </div>
            <p className="text-xs text-[#7A6B68] mt-0.5">
              {isPrivilegedUser
                ? "Apply to represent an additional campus organization or council as an event organizer."
                : "Apply as a campus event organizer to host events, reserve venues, and coordinate participant fast-passes."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-[#651C32] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#521325] transition shrink-0 cursor-pointer flex items-center gap-2"
        >
          <Sparkles size={14} />
          Apply as Organizer
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE5DF]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#8A7B78] hover:bg-[#FAF5F2] cursor-pointer"
            >
              <X size={18} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#651C32]">Apply for Organizer Status</h3>
                <p className="text-xs text-[#7A6B68] mt-1">
                  Submit your organization details to Student Affairs and Administration.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1E1B19]">Organization / Council Name *</label>
                  {selectedOrgId && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Matches recognized org
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  list="org-suggestions"
                  placeholder="e.g. League of Information Technology Students"
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-2.5 text-xs text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none"
                />
                {allOrganizations.length > 0 && (
                  <datalist id="org-suggestions">
                    {allOrganizations.map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.short_name ? `${o.short_name} • ${o.name}` : o.name}
                      </option>
                    ))}
                  </datalist>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1B19]">Your Position *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. President, Events Lead"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-2.5 text-xs text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1B19]">Department / College</label>
                  <input
                    type="text"
                    readOnly={Boolean(defaultCollege)}
                    placeholder="e.g. College of Engineering"
                    value={defaultCollege || department}
                    onChange={(e) => {
                      if (!defaultCollege) setDepartment(e.target.value);
                    }}
                    className={`w-full rounded-xl border border-[#ECE2DC] p-2.5 text-xs focus:outline-none ${
                      defaultCollege
                        ? "bg-neutral-100 text-neutral-600 cursor-not-allowed"
                        : "bg-[#FAF5F2] text-[#1E1B19] focus:bg-white focus:border-[#651C32]"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1E1B19]">Purpose &amp; Planned Events *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Briefly state your upcoming events and why you need organizer access..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full resize-none rounded-xl border border-[#ECE2DC] bg-[#FAF5F2] p-2.5 text-xs text-[#1E1B19] focus:bg-white focus:border-[#651C32] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#ECE2DC] px-4 py-2 text-xs font-semibold text-[#7A6B68] hover:bg-[#FAF5F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#651C32] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#521325] disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
