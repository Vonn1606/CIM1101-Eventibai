import OrSidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import OrOrganizersView from "@/component/admin/OrOrganizerView";
import "./organizer.css";

export const metadata = {
    title: "Eventify - Event & Organizers",
};

export default function OrganizersPage() {
    return (
        <div className="or-root">
            <div className="shell">
                <OrSidebar />
                <div className="content">
                    <Header
                        title="Organizers"
                        profile={{ name: "Admin Office", role: "Student Affairs" }}
                    />
                    <main className="main">
                        <OrOrganizersView />
                    </main>
                </div>
            </div>
        </div>
    );
}