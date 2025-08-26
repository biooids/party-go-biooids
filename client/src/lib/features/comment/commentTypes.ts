// src/lib/features/comment/commentTypes.ts

import { SanitizedUserDto } from "../auth/authTypes";

/**
 * The shape of a comment author's public information.
 */
export type CommentAuthor = Pick<
  SanitizedUserDto,
  "_id" | "name" | "username" | "profileImage"
>;

/**
 * The shape of a single comment object, which can contain replies.
 */
export interface Comment {
  _id: string;
  eventId: string;
  authorId: CommentAuthor; // Author details are populated by the backend
  content: string;
  parentId: string | null;
  replies: Comment[]; // Replies are nested inside their parent
  createdAt: string;
  updatedAt: string;
}

/**
 * The shape of the data needed to create a new comment or reply.
 */
export interface CreateCommentDto {
  content: string;
  parentId?: string | null;
}

/**
 * The shape of the API response when fetching all comments for an event.
 */
export interface GetCommentsApiResponse {
  status: string;
  results: number;
  data: {
    comments: Comment[];
  };
}

/**
 * The shape of the API response after creating a new comment.
 */
export interface CreateCommentApiResponse {
  status: string;
  data: {
    comment: Comment;
  };
}
