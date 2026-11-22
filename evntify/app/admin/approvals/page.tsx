import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import ApApprovalsView from "@/component/admin/ApApprovalsView";
import { getApprovals } from "@/lib/db/stats";
import { getCurrentProfile } from "@/lib/auth/server";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Event Approvals",
};

export default async function ApprovalsPage() {
  const [profile, proposals] = await Promise.all([
    getCurrentProfile(),
    getApprovals(),
  ]);

  const adminProfile = {
    name: profile?.fullName ?? "Admin Office",
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
