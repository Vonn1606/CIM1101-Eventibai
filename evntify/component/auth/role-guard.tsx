"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";

interface RoleGuardProps {
  allowedRole?: "organizer" | "user" | "admin" | "any";
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRole = "any", children }: RoleGuardProps) {
  const { user, loading, isOrganizer, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const destination = allowedRole === "organizer" ? "/organizer-dashboard" : "/my-events";
      router.replace(`/signin?next=${destination}`);
      return;
    }

    if (allowedRole === "organizer" && !isOrganizer && !isAdmin) {
      router.replace("/my-events");
      return;
    }

    if (allowedRole === "user" && isOrganizer) {
      router.replace("/organizer-dashboard");
      return;
    }
  }, [user, loading, isOrganizer, isAdmin, allowedRole, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9fc]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-[#6c0c28] border-t-transparent" />
          <p className="text-xs font-semibold text-neutral-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (allowedRole === "organizer" && !isOrganizer && !isAdmin) return null;
  if (allowedRole === "user" && isOrganizer) return null;

  return <>{children}</>;
}
