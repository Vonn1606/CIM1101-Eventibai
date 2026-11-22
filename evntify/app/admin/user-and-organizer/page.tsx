import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import OrOrganizersView from "@/component/admin/OrOrganizerView";
import { getOrganizers, getAdminStats } from "@/lib/db/stats";
import { getOrganizerApplications } from "@/app/actions/organizer-application";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Event & Organizers",
};

export default async function OrganizersPage() {
  const supabase = await createClient();

  // Auth + data in parallel
  const [authRes, organizers, applications, stats] = await Promise.all([
    supabase.auth.getUser(),
    getOrganizers(),
    getOrganizerApplications(),
    getAdminStats(),
  ]);

  const user = authRes.data.user;
  if (!user) redirect("/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profile as any)?.role !== "admin") redirect("/my-events");

  const adminProfile = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: (profile as any)?.full_name ?? "Admin Office",
    role: "Office of Student Affairs",
  };

  return (
    <div className="admin-root or-root">
      <div className="shell">
        <Sidebar pendingApprovals={stats.pendingApprovals} />
        <div className="content">
          <Header profile={adminProfile} />
          <main className="main">
            <OrOrganizersView initialOrganizers={organizers} initialApplications={applications} />
          </main>
        </div>
      </div>
    </div>
  );
}
