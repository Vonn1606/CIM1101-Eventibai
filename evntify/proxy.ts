import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Only call getUser() when the route actually requires authentication.
  // On fully public paths (landing, events directory, signin, etc.) we skip
  // the network round-trip entirely — saves ~775 ms per public request.
  const requiresAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/organizer-dashboard") ||
    pathname.startsWith("/my-events") ||
    pathname.startsWith("/notifications");

  let user: { id: string } | null = null;
  if (requiresAuth) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // Guard: /admin/* requires admin role
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", request.nextUrl.pathname);
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
        redirectResponse.cookies.set(name, value)
      );
      return redirectResponse;
    }

    // Fetch role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Fix #6 + #5: On DB error, do NOT redirect — let the page handle it gracefully
    if (profileError) {
      console.error("proxy: failed to load profile for admin guard:", profileError);
      return supabaseResponse;
    }

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/my-events";
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
        redirectResponse.cookies.set(name, value)
      );
      return redirectResponse;
    }
  }

  // Guard: /organizer-dashboard requires organizer or admin role
  if (pathname.startsWith("/organizer-dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", request.nextUrl.pathname);
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
        redirectResponse.cookies.set(name, value)
      );
      return redirectResponse;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "organizer" && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/my-events";
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
        redirectResponse.cookies.set(name, value)
      );
      return redirectResponse;
    }
  }

  // Guard: /my-events requires any authenticated user
  if (pathname.startsWith("/my-events")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", request.nextUrl.pathname);
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
        redirectResponse.cookies.set(name, value)
      );
      return redirectResponse;
    }
  }

  // Guard: /notifications requires any authenticated user
  if (pathname.startsWith("/notifications")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", request.nextUrl.pathname);
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
        redirectResponse.cookies.set(name, value)
      );
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

