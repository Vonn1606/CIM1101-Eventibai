import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "organizer" | "student" | "guest";

export interface ServerUserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  department: string | null;
  studentNumber: string | null;
  collegeId: string | null;
  email: string;
}

export interface CurrentUserResult {
  user: User | null;
  error: Error | null;
  isSessionMissing: boolean;
}

/**
 * Returns the currently authenticated Supabase user for the request.
 * Wrapped in React.cache() to run at most once per server request.
 *
 * Crucially distinguishes between:
 * 1. Truly unauthenticated / missing session (isSessionMissing = true)
 * 2. Transient network / timeout errors (error is set, isSessionMissing = false)
 */
export const getCurrentUser = cache(async (): Promise<CurrentUserResult> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      const isMissing =
        error.name === "AuthSessionMissingError" ||
        error.message.toLowerCase().includes("session") ||
        error.message.toLowerCase().includes("not authenticated");

      return {
        user: null,
        error: isMissing ? null : new Error(error.message),
        isSessionMissing: isMissing,
      };
    }

    return {
      user: user ?? null,
      error: null,
      isSessionMissing: !user,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      user: null,
      error: new Error(`Authentication check failed: ${msg}`),
      isSessionMissing: false,
    };
  }
});

/**
 * Returns the profile for the current user, or null if unauthenticated.
 * Wrapped in React.cache() to run at most once per server request.
 */
export const getCurrentProfile = cache(async (): Promise<ServerUserProfile | null> => {
  const { user, error, isSessionMissing } = await getCurrentUser();

  if (error) {
    // Transient error: do not silently swallow as guest/null
    console.warn("[getCurrentProfile] Transient auth error:", error.message);
    throw error;
  }

  if (isSessionMissing || !user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error: profileErr } = await supabase
    .from("profiles")
    .select("id, full_name, role, department, student_number, college_id, email")
    .eq("id", user.id)
    .single();

  if (profileErr) {
    console.error("[getCurrentProfile] Profile lookup error:", profileErr.message);
    throw new Error(`Failed to load profile: ${profileErr.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    fullName: data.full_name ?? "",
    role: (data.role as UserRole) ?? "student",
    department: data.department ?? null,
    studentNumber: data.student_number ?? null,
    collegeId: data.college_id ?? null,
    email: data.email ?? "",
  };
});

/**
 * Enforces authentication. If unauthenticated, safely redirects to /signin.
 * If a database or transient error occurs, throws to error boundary instead of
 * kicking the user out.
 */
export async function requireUser(nextPath?: string): Promise<{ user: User; profile: ServerUserProfile }> {
  const { user, error, isSessionMissing } = await getCurrentUser();

  if (error) {
    throw error;
  }

  if (isSessionMissing || !user) {
    const destination = nextPath ? `/signin?next=${encodeURIComponent(nextPath)}` : "/signin";
    redirect(destination);
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/signin");
  }

  return { user, profile };
}

/**
 * Enforces specific role privileges.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  nextPath?: string
): Promise<{ user: User; profile: ServerUserProfile }> {
  const { user, profile } = await requireUser(nextPath);

  if (!allowedRoles.includes(profile.role)) {
    redirect("/my-events");
  }

  return { user, profile };
}
