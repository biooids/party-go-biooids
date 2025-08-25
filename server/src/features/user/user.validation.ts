// src/features/user/user.validation.ts

import { z } from "zod";

export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .optional(),
    bio: z.string().max(250, "Bio cannot exceed 250 characters").optional(),
    location: z
      .string()
      .max(100, "Location cannot exceed 100 characters")
      .optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string()
        .min(1, "You must enter your current password."),
      newPassword: z
        .string()
        .min(8, "Your new password must be at least 8 characters long."),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from your current password.",
      path: ["newPassword"],
    }),
});
