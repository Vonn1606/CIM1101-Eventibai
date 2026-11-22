import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/admin");
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Fix #5: Distinguish DB error from unauthorized — throw instead of redirecting on error
  if (profileError) {
    console.error("AdminLayout: failed to load profile:", profileError);
    throw new Error("Unable to verify admin permissions due to a database timeout. Please try refreshing.");
  }

  if (profileRow?.role !== "admin") {
    redirect("/my-events");
  }

  return <>{children}</>;
}
