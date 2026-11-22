/**
 * lib/auth/server-session.ts
 *
 * React.cache()-wrapped helpers for server components and layouts.
 * Within a single server request, every call to getCurrentUser() or
 * getCurrentProfile() shares one memoised result — eliminating redundant
 * auth.getUser() and profiles.select("role") round-trips across layouts,
 * pages, and RSC helpers that run in the same request tree.
 *
 * Usage:
 *   import { getCurrentUser, getCurrentProfile } from "@/lib/auth/server-session";
 *   const user    = await getCurrentUser();      // cached per-request
 *   const profile = await getCurrentProfile();   // cached per-request
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Returns the authenticated Supabase user for this request, or null. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

export type UserProfile = {
  id: string;
  role: "student" | "organizer" | "admin" | string;
  full_name: string | null;
  email: string | null;
};

/**
 * Returns the profiles row for the current user, or null if unauthenticated.
 * Calls getCurrentUser() internally — both are memoised so there is at most
 * one getUser() + one profiles query per server request.
 */
export const getCurrentProfile = cache(async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!data) return null;
  return data as UserProfile;
});
