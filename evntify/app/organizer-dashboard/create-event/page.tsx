import type { Metadata } from "next";
import RoleGuard from "@/component/auth/role-guard";
import CreateEventForm from "@/component/organizer/create-event-form";
import CreateEventTopbar from "@/component/organizer/create-event-topbar";
import { createClient } from "@/lib/supabase/server";
import "./create-event.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventify | Create Event",
  description:
    "Submit a new campus event for administration review and publication.",
};

export default async function CreateEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [venuesRes, collegesRes, orgsRes] = await Promise.all([
    supabase.from("venues").select("id, name, capacity, details").order("name"),
    supabase.from("colleges").select("id, name, code").order("name"),
    user
      ? supabase
        .from("organization_members")
        .select("organization_id, organizations ( id, name, dept_label )")
        .eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const venues = venuesRes.data ?? [];
  const colleges = collegesRes.data ?? [];
  const organizations = ((orgsRes.data ?? []) as Array<{
    organizations: { id: string; name: string; dept_label: string | null } | null;
  }>)
    .map((m) => m.organizations)
    .filter(
      (org): org is { id: string; name: string; dept_label: string | null } =>
        Boolean(org)
    );

  return (
    <RoleGuard allowedRole="organizer">
      <div className="ce-page">
        <CreateEventTopbar />
        <main className="ce-main">
          <CreateEventForm
            venues={venues}
            colleges={colleges}
            organizations={organizations}
          />
        </main>
      </div>
    </RoleGuard>
  );
}
