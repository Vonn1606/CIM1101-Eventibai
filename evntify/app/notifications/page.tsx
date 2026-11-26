import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function NotificationsRedirectPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/signin");
  }
  if (profile.role === "admin") {
    redirect("/admin");
  }
  if (profile.role === "organizer") {
    redirect("/organizer-dashboard");
  }
  redirect("/events");
}
