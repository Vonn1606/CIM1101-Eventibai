import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side role-based redirect handler.
 *
 * After signInWithPassword() sets the session cookie on the client,
 * the browser hits this endpoint. The server validates the token,
 * fetches the role in a single DB query, and redirects — no extra
 * client-side round-trips needed.
 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get("next");

  try {
    const supabase = await createClient();

    // Validate the JWT with Supabase Auth server (secure server-side check)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/signin`);
    }

    // Single DB query to determine role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (profile as any)?.role as string | undefined;
    // P0-3: Admin -> /admin, Organizer -> /organizer-dashboard, Student -> /events.
    // If a specific valid `next` was provided, it takes precedence.
    const home =
      role === "admin"
        ? "/admin"
        : role === "organizer"
          ? "/organizer-dashboard"
          : "/events";

    // Validate `next` param — must be a safe relative path and role-appropriate
    const safe =
      typeof next === "string" &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      !next.startsWith("/\\");
    const allowed =
      safe &&
      (!next!.startsWith("/admin") || role === "admin") &&
      (!next!.startsWith("/organizer-dashboard") || role !== "student");

    return NextResponse.redirect(`${origin}${allowed ? next! : home}`);
  } catch (err) {
    console.error("[/auth/redirect] Unexpected error:", err);
    return NextResponse.redirect(`${origin}/signin`);
  }
}
