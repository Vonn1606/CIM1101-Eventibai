import ApSidebar from "@/component/admin/ApSidebar";
import Header from "@/component/admin/Header";
import ApApprovalsView from "@/component/admin/ApApprovalsView";
import "./approvals.css";

export const metadata = {
  title: "Eventify - Event Approvals",
};

export default function ApprovalsPage() {
  return (
    <div className="ap-root">
      <div className="shell">
        <ApSidebar />
        <div className="content">
          <Header
            title="Approvals"
            profile={{ name: "Admin Office", role: "Student Affairs" }}
          />
          <main className="main">
            <ApApprovalsView />
          </main>
        </div>
      </div>
    </div>
  );
}

