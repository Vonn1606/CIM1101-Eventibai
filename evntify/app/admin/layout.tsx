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

  if (profileError) {
    console.error("AdminLayout: failed to load profile:", profileError);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (profileRow as any)?.role;

  if (role !== "admin") {
    redirect("/my-events");
  }

  return <>{children}</>;
}
