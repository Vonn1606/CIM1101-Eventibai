import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/component/admin/Sidebar";
import Header from "@/component/admin/Header";
import EdEventsView from "@/component/admin/EdEventsView";
import { getEventsDirectory, getPendingApprovalsCount } from "@/lib/db/stats";
import "../admin.css";

// Admin pages render at request time (auth-protected, user-specific data)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventify - Events Directory",
};

export default async function EventsDirectoryPage() {
  const supabase = await createClient();

  // Auth + data in parallel; getEventsDirectory is safe (returns [] on error)
  const [authRes, eventsRes, pendingApprovals] = await Promise.all([
    supabase.auth.getUser(),
    getEventsDirectory(1, 12),
    getPendingApprovalsCount(),
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

  const { items, total } = eventsRes;

  return (
    <div className="admin-root ed-root">
      <div className="shell">
        <Sidebar pendingApprovals={pendingApprovals} />
        <div className="content">
          <Header profile={adminProfile} />
          <main className="main">
            <EdEventsView initialEvents={items} total={total} />
          </main>
        </div>
      </div>
    </div>
  );
}
