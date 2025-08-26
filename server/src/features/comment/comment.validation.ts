// src/features/comment/comment.validation.ts

import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Comment cannot be empty.")
      .max(1000, "Comment cannot exceed 1000 characters."),
    // parentId is optional, but if it exists, it must be a valid ObjectId string.
    parentId: z
      .string()
      .regex(objectIdRegex, "Invalid parent comment ID.")
      .optional()
      .nullable(),
  }),
});
