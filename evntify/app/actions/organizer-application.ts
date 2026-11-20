"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SubmitOrganizerAppInput {
  organizationId?: string;
  orgName: string;
  position: string;
  department?: string;
  reason: string;
}

export async function submitOrganizerApplication(input: SubmitOrganizerAppInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to apply as an organizer." };
  }

  if (!input.orgName.trim()) {
    return { error: "Organization name is required." };
  }
  if (!input.position.trim()) {
    return { error: "Position or role title is required." };
  }
  if (!input.reason.trim()) {
    return { error: "Please provide a reason or statement for your application." };
  }

  // Check if there's already a pending application from this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("organizer_applications")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return { error: "You already have a pending organizer application under review." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("organizer_applications").insert({
    user_id: user.id,
    organization_id: input.organizationId || null,
    org_name: input.orgName.trim(),
    position: input.position.trim(),
    department: input.department?.trim() || null,
    reason: input.reason.trim(),
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/my-events");
  revalidatePath("/admin/user-and-organizer");
  return { success: true };
}

export async function getUserOrganizerApplication() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("organizer_applications")
    .select("id, org_name, position, department, status, created_at, admin_notes")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getOrganizerApplications() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("organizer_applications")
    .select(`
      id, org_name, position, department, reason, status, created_at,
      profiles:user_id ( id, full_name, email, student_number )
    `)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => ({
    id: row.id,
    userId: row.profiles?.id,
    applicantName: row.profiles?.full_name ?? "Student",
    applicantEmail: row.profiles?.email ?? "",
    studentNumber: row.profiles?.student_number ?? "",
    orgName: row.org_name,
    position: row.position,
    department: row.department ?? "",
    reason: row.reason,
    status: row.status,
    createdAt: new Date(row.created_at).toLocaleDateString("en-US", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));
}

export async function decideOrganizerApplication(
  applicationId: string,
  decision: "approved" | "rejected",
  adminNotes?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // Fetch application
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: appRow, error: fetchErr } = await (supabase as any)
    .from("organizer_applications")
    .select("id, user_id, organization_id, org_name, position")
    .eq("id", applicationId)
    .single();

  if (fetchErr || !appRow) return { error: "Application not found." };

  // Update application
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabase as any)
    .from("organizer_applications")
    .update({
      status: decision,
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", applicationId);

  if (updateErr) return { error: updateErr.message };

  // If approved:
  if (decision === "approved") {
    // 1. Promote profile role to organizer
    await supabase.from("profiles").update({ role: "organizer" }).eq("id", appRow.user_id);

    // 2. Resolve or create organization
    let orgId = appRow.organization_id;
    if (!orgId) {
      const { data: matchedOrg } = await supabase
        .from("organizations")
        .select("id")
        .ilike("name", appRow.org_name)
        .maybeSingle();

      if (matchedOrg) {
        orgId = matchedOrg.id;
      } else {
        const { data: newOrg } = await supabase
          .from("organizations")
          .insert({ name: appRow.org_name, short_name: appRow.org_name.slice(0, 10).toUpperCase() })
          .select("id")
          .single();
        if (newOrg) orgId = newOrg.id;
      }
    }

    // 3. Link user in organization_members
    if (orgId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: memberUpsertErr } = await (supabase as any).from("organization_members").upsert(
        {
          organization_id: orgId,
          user_id: appRow.user_id,
          position: appRow.position || "Officer",
        },
        { onConflict: "organization_id,user_id" }
      );
      if (memberUpsertErr) {
        console.error("[decideOrganizerApplication] Failed to insert organization member:", memberUpsertErr);
        return { error: `Approved role, but failed to link organization: ${memberUpsertErr.message}` };
      }
    } else {
      return { error: "Approved role, but could not resolve target organization ID." };
    }
  }

  revalidatePath("/admin/user-and-organizer");
  revalidatePath("/organizer-dashboard");
  return { success: true };
}

export async function createOrganizationWithOrganizer(input: {
  orgName: string;
  collegeId?: string;
  studentEmailOrNumber: string;
  position: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // 1. Find profile by email or student number
  const term = input.studentEmailOrNumber.trim();
  const { data: targetProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .or(`email.ilike.%${term}%,student_number.eq.${term}`)
    .maybeSingle();

  if (profileErr || !targetProfile) {
    return { error: `No student profile found for "${term}".` };
  }

  // 2. Create organization
  const { data: newOrg, error: orgErr } = await supabase
    .from("organizations")
    .insert({
      name: input.orgName.trim(),
      short_name: input.orgName.trim().slice(0, 10).toUpperCase(),
      college_id: input.collegeId || null,
    })
    .select("id")
    .single();

  if (orgErr || !newOrg) {
    return { error: orgErr?.message ?? "Failed to create organization." };
  }

  // 3. Update target profile role to organizer
  await supabase.from("profiles").update({ role: "organizer" }).eq("id", targetProfile.id);

  // 4. Insert into organization_members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: memberErr } = await (supabase as any).from("organization_members").upsert(
    {
      organization_id: newOrg.id,
      user_id: targetProfile.id,
      position: input.position.trim() || "Lead",
    },
    { onConflict: "organization_id,user_id" }
  );

  if (memberErr) return { error: memberErr.message };

  revalidatePath("/admin/user-and-organizer");
  return { success: true, studentName: targetProfile.full_name };
}
