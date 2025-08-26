// src/features/comment/comment.service.ts

import Comment from "./comment.model.js";
import { CreateCommentInputDto } from "./comment.types.js";
import { createHttpError } from "../../utils/error.factory.js";
import { SystemRole } from "../../types/user.types.js";
import { logger } from "../../config/logger.js";

export class CommentService {
  /**
   * Creates a new comment or a reply on an event.
   */
  async createComment(
    input: CreateCommentInputDto,
    eventId: string,
    authorId: string
  ) {
    const newComment = await Comment.create({
      ...input,
      eventId,
      authorId,
    });
    logger.info(
      { commentId: newComment._id, eventId, authorId },
      "New comment posted."
    );
    // Populate author details for the immediate response
    return newComment.populate({
      path: "authorId",
      select: "name username profileImage",
    });
  }

  /**
   * Retrieves all comments for a specific event, structured as threads.
   */
  async getCommentsByEventId(eventId: string) {
    const comments = await Comment.find({ eventId })
      .populate("authorId", "name username profileImage")
      .sort({ createdAt: -1 })
      .lean();

    // Structure comments into parent comments with an array of replies
    const commentMap = new Map();
    const parentComments = [];

    for (const comment of comments) {
      commentMap.set(comment._id.toString(), { ...comment, replies: [] });
    }

    for (const comment of comments) {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId.toString());
        if (parent) {
          parent.replies.unshift(comment); // Add reply to the beginning of the array
        }
      } else {
        parentComments.push(commentMap.get(comment._id.toString()));
      }
    }

    return parentComments;
  }

  /**
   * Updates a comment. Only the original author can edit their comment.
   */
  async updateComment(commentId: string, content: string, authorId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw createHttpError(404, "Comment not found.");
    }

    if (comment.authorId.toString() !== authorId) {
      throw createHttpError(403, "You can only edit your own comments.");
    }

    comment.content = content;
    await comment.save();
    logger.info({ commentId, authorId }, "Comment updated.");
    return comment.populate({
      path: "authorId",
      select: "name username profileImage",
    });
  }

  /**
   * Deletes a comment. Also deletes all direct replies to that comment.
   */
  async deleteComment(
    commentId: string,
    user: { id: string; systemRole: SystemRole }
  ) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw createHttpError(404, "Comment not found.");
    }

    // Permission check: Only the author or an admin can delete.
    if (
      comment.authorId.toString() !== user.id &&
      user.systemRole !== SystemRole.ADMIN &&
      user.systemRole !== SystemRole.SUPER_ADMIN
    ) {
      throw createHttpError(
        403,
        "You do not have permission to delete this comment."
      );
    }

    // If it's a parent comment, delete all its replies as well.
    if (!comment.parentId) {
      await Comment.deleteMany({ parentId: commentId });
    }

    await Comment.findByIdAndDelete(commentId);
    logger.warn({ commentId, userId: user.id }, "Comment deleted.");
    return { message: "Comment deleted successfully." };
  }
}

export const commentService = new CommentService();
