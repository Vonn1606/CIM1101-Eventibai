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

async function fetchProfile(userId: string): Promise<UserProfile | null> {
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
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    role: (row.role as UserRole) ?? "student",
    department: row.department ?? null,
    studentNumber: row.student_number ?? null,
    collegeId: row.college_id ?? null,
    email: row.email ?? "",
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>("guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        setProfile(p);
        setRole(p?.role ?? "student");
      } else {
        setProfile(null);
        setRole("guest");
      }
      setLoading(false);
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        setProfile(p);
        setRole(p?.role ?? "student");
      } else {
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
