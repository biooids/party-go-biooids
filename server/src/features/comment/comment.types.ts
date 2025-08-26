// src/features/comment/comment.types.ts

import { Types } from "mongoose";

export interface Comment {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  authorId: Types.ObjectId; // This can be populated to a User object
  content: string;
  parentId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for creating a new comment.
 * The eventId will come from the URL params, not the request body.
 */
export interface CreateCommentInputDto {
  content: string;
  parentId?: string | null; // parentId is optional
}
