// src/features/comment/comment.service.ts

import Comment from "./comment.model.js";
import { CreateCommentInputDto } from "./comment.types.js";
import { createHttpError } from "../../utils/error.factory.js";
import { SystemRole } from "../../types/user.types.js";
import { logger } from "../../config/logger.js";
import EventModel from "../event/event.model.js";
import { config } from "../../config/index.js"; // ✅ ADDED: The missing import for the config object.

export class CommentService {
  /**
   * Creates a new comment or a reply and increments the relevant counters.
   */
  /**
   * Creates a new comment or a reply and increments the relevant counters.
   * Uses transactions only in the production environment.
   */
  async createComment(
    input: CreateCommentInputDto,
    eventId: string,
    authorId: string
  ) {
    const newComment = new Comment({
      ...input,
      eventId,
      authorId,
    });

    // ✅ Conditionally start a session only in production
    const session =
      config.nodeEnv === "production" ? await Comment.startSession() : null;
    if (session) session.startTransaction();

    try {
      await newComment.save(session ? { session } : {});

      await EventModel.findByIdAndUpdate(
        eventId,
        { $inc: { commentCount: 1 } },
        session ? { session } : {}
      );

      if (newComment.parentId) {
        await Comment.findByIdAndUpdate(
          newComment.parentId,
          { $inc: { replyCount: 1 } },
          session ? { session } : {}
        );
      }

      if (session) await session.commitTransaction();

      logger.info(
        { commentId: newComment._id, eventId, authorId },
        "New comment posted and counters updated."
      );

      return newComment.populate({
        path: "authorId",
        select: "name username profileImage",
      });
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
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
   * Deletes a comment and decrements the relevant counters.
   */
  /**
   * Deletes a comment and decrements the relevant counters.
   * Uses transactions only in the production environment.
   */
  async deleteComment(
    commentId: string,
    user: { id: string; systemRole: SystemRole }
  ) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw createHttpError(404, "Comment not found.");
    }

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

    // ✅ Conditionally start a session only in production
    const session =
      config.nodeEnv === "production" ? await Comment.startSession() : null;
    if (session) session.startTransaction();

    try {
      let decrementCount = 1;

      if (!comment.parentId) {
        const repliesToDelete = await Comment.find({
          parentId: commentId,
        }).lean();
        decrementCount += repliesToDelete.length;
        if (repliesToDelete.length > 0) {
          await Comment.deleteMany(
            { parentId: commentId },
            session ? { session } : {}
          );
        }
      } else {
        await Comment.findByIdAndUpdate(
          comment.parentId,
          { $inc: { replyCount: -1 } },
          session ? { session } : {}
        );
      }

      await EventModel.findByIdAndUpdate(
        comment.eventId,
        { $inc: { commentCount: -decrementCount } },
        session ? { session } : {}
      );

      await Comment.findByIdAndDelete(commentId, session ? { session } : {});

      if (session) await session.commitTransaction();

      logger.warn(
        { commentId, userId: user.id },
        "Comment and any replies deleted, counters updated."
      );

      return { message: "Comment deleted successfully." };
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }
}

export const commentService = new CommentService();
