"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/actions/admin";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const adminCheck = await requireAdmin(supabase, user.id);
  if (!adminCheck.ok) return [];

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

  const adminCheck = await requireAdmin(supabase, user.id);
  if (!adminCheck.ok) return { error: adminCheck.error };

  // Use admin (service-role) client if configured to safely perform cross-user updates
  const adminDb = createAdminClient() ?? supabase;

  // Fetch application
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: appRow, error: fetchErr } = await (adminDb as any)
    .from("organizer_applications")
    .select("id, user_id, organization_id, org_name, position, department")
    .eq("id", applicationId)
    .single();

  if (fetchErr || !appRow) return { error: "Application not found." };

  // If approved:
  if (decision === "approved") {
    // 1. Resolve or create organization FIRST before role promotion
    let orgId = appRow.organization_id;
    if (!orgId) {
      const trimmedName = appRow.org_name.trim();

      // Check case-insensitive match on name or short_name (limit 1 to avoid multi-row errors)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: matchedOrgs } = await (adminDb as any)
        .from("organizations")
        .select("id, name, short_name")
        .or(`name.ilike.${trimmedName},short_name.ilike.${trimmedName}`)
        .limit(1);

      if (matchedOrgs && matchedOrgs.length > 0) {
        orgId = matchedOrgs[0].id;
      } else {
        const words = trimmedName.split(/\s+/);
        const autoShort =
          words.length > 1
            ? words
                .map((w: string) => w[0])
                .join("")
                .slice(0, 10)
                .toUpperCase()
            : trimmedName.slice(0, 10).toUpperCase();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newOrg, error: newOrgErr } = await (adminDb as any)
          .from("organizations")
          .insert({
            name: trimmedName,
            short_name: autoShort,
            dept_label: appRow.department?.trim() || null,
          })
          .select("id")
          .single();

        if (newOrgErr) {
          console.error("[decideOrganizerApplication] Failed to create organization:", newOrgErr.message);
          return { error: `Failed to create organization: ${newOrgErr.message}` };
        }
        if (newOrg) {
          orgId = newOrg.id;
        }
      }
    }

    if (!orgId) {
      return { error: "Could not resolve or create target organization." };
    }

    // Persist resolved organization_id back to application
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminDb as any)
      .from("organizer_applications")
      .update({ organization_id: orgId })
      .eq("id", applicationId);

    // 2. Link user in organization_members BEFORE promoting role.
    // If membership creation fails, we do NOT leave the user in an orphaned "organizer" role.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: memberUpsertErr } = await (adminDb as any).from("organization_members").upsert(
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

    // 3. Promote profile role to organizer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: roleErr } = await (adminDb as any)
      .from("profiles")
      .update({ role: "organizer" })
      .eq("id", appRow.user_id);

    if (roleErr) return { error: `Could not promote user: ${roleErr.message}` };

    // 4. Update application status to approved
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (adminDb as any)
      .from("organizer_applications")
      .update({
        status: "approved",
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", applicationId);

    if (updateErr) return { error: updateErr.message };
  } else {
    // Decision is "rejected"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (adminDb as any)
      .from("organizer_applications")
      .update({
        status: "rejected",
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", applicationId);

    if (updateErr) return { error: updateErr.message };
  }

  // Notify the applicant of the decision (non-blocking)
  try {
    const isApproved = decision === "approved";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminDb as any).from("notifications").insert({
      user_id: appRow.user_id,
      title: isApproved
        ? "Organizer Application Approved 🎉"
        : "Organizer Application Rejected",
      body: isApproved
        ? `Your application to organize events has been approved. You can now create events on Eventify.${adminNotes ? ` Note: ${adminNotes}` : ""}`
        : `Your organizer application was not approved at this time.${adminNotes ? ` Reason: ${adminNotes}` : ""}`,
      link: isApproved ? "/organizer-dashboard" : "/my-events",
    });
  } catch {
    // non-blocking: failure here does not roll back the decision
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

  const adminCheck = await requireAdmin(supabase, user.id);
  if (!adminCheck.ok) return { error: adminCheck.error };

  const adminDb = createAdminClient() ?? supabase;

  // 1. Find profile by email or student number
  const term = input.studentEmailOrNumber.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: targetProfile, error: profileErr } = await (adminDb as any)
    .from("profiles")
    .select("id, role, full_name")
    .or(`email.eq.${term},student_number.eq.${term}`)
    .maybeSingle();

  if (profileErr || !targetProfile) {
    return { error: `No student profile found for "${term}".` };
  }

  // 2. Create organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newOrg, error: orgErr } = await (adminDb as any)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminDb as any).from("profiles").update({ role: "organizer" }).eq("id", targetProfile.id);

  // 4. Insert into organization_members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: memberErr } = await (adminDb as any).from("organization_members").upsert(
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
