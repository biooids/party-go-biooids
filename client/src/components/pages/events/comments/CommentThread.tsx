// src/components/pages/events/comments/CommentThread.tsx

"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@/lib/features/comment/commentTypes";
import CommentForm from "./CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const CommentItem = ({ comment }: { comment: Comment }) => (
  <div className="flex items-start gap-4">
    <Avatar className="h-9 w-9">
      <AvatarImage src={comment.authorId.profileImage ?? ""} />
      <AvatarFallback>{getInitials(comment.authorId.name)}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-sm">@{comment.authorId.username}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      <p className="text-sm mt-1">{comment.content}</p>
    </div>
  </div>
);

export default function CommentThread({
  comment,
  eventId,
}: {
  comment: Comment;
  eventId: string;
}) {
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className="space-y-4">
      {/* Parent Comment */}
      <CommentItem comment={comment} />

      {/* Reply Button & Form */}
      <div className="pl-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsReplying(!isReplying)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Reply
        </Button>
        {isReplying && (
          <div className="mt-4">
            <CommentForm
              eventId={eventId}
              parentId={comment._id}
              onCommentPosted={() => setIsReplying(false)}
              placeholder={`Replying to @${comment.authorId.username}...`}
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-12 space-y-4 border-l-2 ml-5">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="pl-5">
              <CommentItem comment={reply} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
