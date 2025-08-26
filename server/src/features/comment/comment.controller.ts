// src/features/comment/comment.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { commentService } from "./comment.service.js";
import { SystemRole } from "../../types/user.types.js";

class CommentController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const authorId = req.user!.id;
    const comment = await commentService.createComment(
      req.body,
      eventId,
      authorId
    );
    res.status(201).json({ status: "success", data: { comment } });
  });

  getByEventId = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const comments = await commentService.getCommentsByEventId(eventId);
    res.status(200).json({
      status: "success",
      results: comments.length,
      data: { comments },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const authorId = req.user!.id;
    const updatedComment = await commentService.updateComment(
      commentId,
      content,
      authorId
    );
    res
      .status(200)
      .json({ status: "success", data: { comment: updatedComment } });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const user = {
      id: req.user!.id,
      systemRole: req.user!.systemRole as SystemRole,
    };
    await commentService.deleteComment(commentId, user);
    res.status(204).send();
  });
}

export const commentController = new CommentController();
