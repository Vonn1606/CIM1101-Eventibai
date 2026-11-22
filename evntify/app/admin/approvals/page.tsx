import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import ApApprovalsView from "@/component/admin/ApApprovalsView";
import { getApprovals } from "@/lib/db/stats";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Event Approvals",
};

export default async function ApprovalsPage() {
  const supabase = await createClient();

  // Auth + data in parallel
  const [authRes, proposals] = await Promise.all([
    supabase.auth.getUser(),
    getApprovals(),
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

  const pendingCount = proposals.filter((p) => !p.decision || p.decision === "pending").length;

  return (
    <div className="admin-root ap-root">
      <div className="shell">
        <Sidebar pendingApprovals={pendingCount} />
        <div className="content">
          <Header profile={adminProfile} />
          <main className="main">
            <ApApprovalsView initialProposals={proposals} />
          </main>
        </div>
      </div>
    </div>
  );
}
