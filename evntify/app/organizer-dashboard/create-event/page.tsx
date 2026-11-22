import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CreateEventForm from "@/component/organizer/create-event-form";
import CreateEventTopbar from "@/component/organizer/create-event-topbar";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/server";
import { getActiveOrgId } from "@/lib/db/active-org";
import "./create-event.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventify | Create Event",
  description:
    "Submit a new campus event for administration review and publication.",
};

export default async function CreateEventPage() {
  const { user, profile } = await requireRole(["organizer", "admin"], "/organizer-dashboard/create-event");
  const supabase = await createClient();

  // Fetch org membership with org details in a single query.
  // This is used both for the guard check and to populate the org selector.
  const { data: memberRows, error: memberErr } = await supabase
    .from("organization_members")
    .select("organization_id, organizations ( id, name, dept_label )")
    .eq("user_id", user.id);

  if (memberErr) {
    console.error("[CreateEventPage] Error fetching organization membership:", memberErr.message);
  }

  const hasLinkedOrg = Array.isArray(memberRows) && memberRows.length > 0;

  if (profile.role === "organizer" && !hasLinkedOrg) {
    redirect("/organizer-dashboard?error=no-org");
  }

  const [venuesRes, collegesRes, activeOrgId] = await Promise.all([
    supabase.from("venues").select("id, name, capacity, details").order("name"),
    supabase.from("colleges").select("id, name, code").order("name"),
    getActiveOrgId(supabase, user.id),
  ]);

  const venues = venuesRes.data ?? [];
  const colleges = collegesRes.data ?? [];
  const organizations = ((memberRows ?? []) as Array<{
    organizations: { id: string; name: string; dept_label: string | null } | null;
  }>)
    .map((m) => m.organizations)
    .filter(
      (org): org is { id: string; name: string; dept_label: string | null } =>
        Boolean(org)
    );

  return (
    <div className="ce-page">
      <CreateEventTopbar />
      <main className="ce-main">
        <CreateEventForm
          venues={venues}
          colleges={colleges}
          organizations={organizations}
          defaultOrganizationId={activeOrgId ?? undefined}
        />
      </main>
    </div>
  );
}
