"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "organizer" | "student" | "guest";

async function fetchRole(userId: string): Promise<UserRole> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any)?.role as UserRole) ?? "student";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
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
        setRole(await fetchRole(currentUser.id));
      } else {
        setRole("guest");
      }
      setLoading(false);
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        setRole(await fetchRole(currentUser.id));
      } else {
        setRole("guest");
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    role,
    isOrganizer: role === "organizer" || role === "admin",
    isAdmin: role === "admin",
    isUser: role === "student",
  };
}
