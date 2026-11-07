import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import ApApprovalsView from "@/component/admin/ApApprovalsView";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const instant = false;

export const metadata = {
  title: "Eventify - Event Approvals",
};

export default function ApprovalsPage() {
  return (
    <div className="admin-root ap-root">
      <div className="shell">
        <Sidebar />
        <div className="content">
          <Header />
          <main className="main">
            <ApApprovalsView />
          </main>
        </div>
      </div>
    </div>
  );
}
