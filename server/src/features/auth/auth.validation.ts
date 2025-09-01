//src/features/auth/auth.validation.ts
import { z } from "zod";

// ✅ UPDATED: This schema now only validates email and password for signup.
export const signupSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, { message: "Email is required." })
      .pipe(z.email("Please enter a valid email address.")),
    password: z.string().min(8, "Password must be at least 8 characters long."),
  }),
});

// This schema remains unchanged.
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required.")
      .pipe(z.email("Please enter a valid email address.")),
    password: z.string().min(1, "Password is required."),
  }),
});
