"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "organizer" | "student" | "guest";

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  department: string | null;
  studentNumber: string | null;
  collegeId: string | null;
  email: string;
}

// Cache active profile in memory to avoid duplicate fetches across hooks
let cachedProfile: UserProfile | null = null;
let cachedUserId: string | null = null;

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (cachedUserId === userId && cachedProfile) {
    return cachedProfile;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, department, student_number, college_id, email")
    .eq("id", userId)
    .single();

  if (!data) return null;
  const row = data as {
    id: string;
    full_name: string | null;
    role: string | null;
    department: string | null;
    student_number: string | null;
    college_id: string | null;
    email: string | null;
  };
  const profile: UserProfile = {
    id: row.id,
    fullName: row.full_name ?? "",
    role: (row.role as UserRole) ?? "student",
    department: row.department ?? null,
    studentNumber: row.student_number ?? null,
    collegeId: row.college_id ?? null,
    email: row.email ?? "",
  };
  cachedUserId = userId;
  cachedProfile = profile;
  return profile;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [role, setRole] = useState<UserRole>(cachedProfile?.role ?? "guest");
  const [loading, setLoading] = useState(!cachedProfile);

  useEffect(() => {
    const supabase = createClient();

    async function loadSession() {
      // getSession() checks local storage/cookies first without an unneeded roundtrip
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        setProfile(p);
        setRole(p?.role ?? "student");
      } else {
        cachedProfile = null;
        cachedUserId = null;
        setProfile(null);
        setRole("guest");
      }
      setLoading(false);
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip redundant refetch on INITIAL_SESSION if already loaded
      if (event === "INITIAL_SESSION" && cachedProfile) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        if (event === "SIGNED_OUT") {
          cachedProfile = null;
          cachedUserId = null;
        }
        const p = await fetchProfile(currentUser.id);
        setProfile(p);
        setRole(p?.role ?? "student");
      } else {
        cachedProfile = null;
        cachedUserId = null;
        setProfile(null);
        setRole("guest");
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    role,
    isOrganizer: role === "organizer" || role === "admin",
    isAdmin: role === "admin",
    isUser: role === "student",
  };
}
