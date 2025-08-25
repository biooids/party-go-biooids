// src/lib/features/auth/auth.schemas.ts

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .pipe(z.email("Invalid email address.")),
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Your name is required."),
    username: z.string().min(3, "Username must be at least 3 characters long."),
    email: z
      .string()
      .min(1, "Email is required.")
      .pipe(z.email("Invalid email address.")),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
