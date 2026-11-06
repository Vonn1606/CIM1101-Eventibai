import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import RoleGuard from "@/component/auth/role-guard";
import CreateEventForm from "@/component/organizer/create-event-form";
import CreateEventTopbar from "@/component/organizer/create-event-topbar";
import "./create-event.css";

export const metadata: Metadata = {
  title: "Eventify | Create Event",
  description:
    "Submit a new campus event for administration review and publication.",
};

export default function CreateEventPage() {
  return (
    <RoleGuard allowedRole="organizer">
      <div className="ce-page">
        <CreateEventTopbar />
        <main className="ce-main">
          <CreateEventForm />
        </main>
      </div>
    </RoleGuard>
  );
}
