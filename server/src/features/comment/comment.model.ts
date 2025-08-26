// src/features/comment/comment.model.ts

import { Schema, model, Types } from "mongoose";

const commentSchema = new Schema(
  {
    eventId: {
      type: Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    authorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    // If parentId exists, this is a reply. If null, it's a top-level comment.
    parentId: {
      type: Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Comment = model("Comment", commentSchema);
export default Comment;
