import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import ApApprovalsView from "@/component/admin/ApApprovalsView";
import { getApprovals, getAdminProfile } from "@/lib/db/stats";
import "../admin.css";

export const metadata = {
  title: "Eventify - Event Approvals",
};

export default async function ApprovalsPage() {
  const [proposals, adminProfile] = await Promise.all([
    getApprovals(),
    getAdminProfile(),
  ]);

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
