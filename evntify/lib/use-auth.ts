"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "organizer" | "user" | "guest";

export function getRoleFromUser(user: User | null): UserRole {
    if (!user) return "guest";

    const metaRole = (user.user_metadata?.role as string | undefined)?.toLowerCase();
    if (metaRole === "admin") return "admin";
    if (metaRole === "organizer" || metaRole === "org") return "organizer";
    if (metaRole === "user" || metaRole === "student") return "user";

    const email = (user.email ?? "").toLowerCase();
    if (email.includes("admin")) return "admin";
    if (["org", "lits", "council", "organizer"].some((k) => email.includes(k))) return "organizer";

    return "user";
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    const role = getRoleFromUser(user);

    return {
        user,
        loading,
        role,
        isOrganizer: role === "organizer" || role === "admin",
        isAdmin: role === "admin",
        isUser: role === "user",
    };
}
