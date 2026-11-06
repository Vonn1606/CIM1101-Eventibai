"use server";

import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations";
import { z } from "zod";

export type AuthActionResult = {
  error?: string;
  success?: boolean;
};

export async function signUp(input: z.infer<typeof signUpSchema>): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password, full_name, student_number, college } = parsed.data;

  const supabase = await createClient();

  const { data: collegeRow, error: collegeError } = await supabase
    .from("colleges")
    .select("slug")
    .eq("slug", college)
    .maybeSingle();

  if (collegeError) return { error: "Could not verify your college. Please try again." };
  if (!collegeRow) return { error: "Please select a valid college" };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        student_number,
        college, // slug of a row in `colleges`
      },
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}
