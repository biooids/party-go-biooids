//src/lib/features/auth/auth.schemas.ts
import { z } from "zod";

// No changes needed for the login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .pipe(z.email("Invalid email address.")),
  password: z.string().min(1, "Password is required."),
});

// ✅ UPDATED: The 'acceptTerms' validation is re-introduced here.
// This schema now defines the complete shape of the form's values.
export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required.")
      .pipe(z.email("Invalid email address.")),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
    // This ensures the checkbox is present and checked in the form.
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// These types are automatically inferred from the schemas above
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
