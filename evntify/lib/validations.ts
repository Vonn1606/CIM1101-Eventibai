import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signUpSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .refine((e) => e.toLowerCase().endsWith("@ue.edu.ph"), {
      message: "Must be a UE school email (@ue.edu.ph)",
    }),
  student_number: z
    .string()
    .min(1, "Student number is required")
    .regex(/^\d{4}-\d{5}-\w{2}$/, "Format must be YYYY-NNNNN-XX"),
  // Slug of a row in the `colleges` table; existence is verified in the signUp action.
  college: z.string().min(1, "Please select a college"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ── Registration ───────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  studentNumber: z
    .string()
    .regex(/^\d{4}-\d{5}-\w{2}$/, "Format must be YYYY-NNNNN-XX")
    .optional()
    .or(z.literal("")),
  college: z.string().optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
