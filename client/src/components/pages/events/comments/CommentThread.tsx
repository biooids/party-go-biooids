//src/components/pages/events/comments/CommentThread.tsx

"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@/lib/features/comment/commentTypes";
import CommentForm from "./CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDeleteCommentMutation } from "@/lib/features/comment/commentApiSlice";
import { toast } from "sonner";
import Link from "next/link";

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const renderCommentContent = (content: string) => {
  const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
  const parts = content.split(mentionRegex);
  return parts.map((part, index) => {
    if (mentionRegex.test(part)) {
      const username = part.substring(1);
      return (
        <Link
          key={index}
          href={`/profile/${username}`}
          className="text-primary font-semibold hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const CommentItem = ({
  comment,
  eventId,
  parentCommentId,
  onReplyClick,
}: {
  comment: Comment;
  eventId: string;
  parentCommentId: string;
  onReplyClick: (username: string) => void;
}) => {
  const { user } = useAuth();
  const [deleteComment, { isLoading }] = useDeleteCommentMutation();
  const [isEditing, setIsEditing] = useState(false);
  const isAuthor = user?._id === comment.authorId._id;

  const handleDelete = () => {
    toast.promise(deleteComment({ commentId: comment._id, eventId }).unwrap(), {
      loading: "Deleting comment...",
      success: "Comment deleted.",
      error: "Failed to delete comment.",
    });
  };

  return (
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

        {isEditing ? (
          <div className="w-full mt-2">
            <CommentForm
              eventId={eventId}
              commentToEdit={comment}
              onFinished={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <>
            <p className="text-sm mt-1 whitespace-pre-wrap">
              {renderCommentContent(comment.content)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto px-2 py-1"
                onClick={() => onReplyClick(comment.authorId.username)}
              >
                <MessageSquare className="mr-1 h-3 w-3" />
                Reply
              </Button>
              {isAuthor && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto px-2 py-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive text-xs h-auto px-2 py-1"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function CommentThread({
  comment,
  eventId,
}: {
  comment: Comment;
  eventId: string;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplyClick = (username: string) => {
    setIsReplying(true);
    setReplyContent(`@${username} `);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={comment.authorId.profileImage ?? ""} />
          <AvatarFallback>{getInitials(comment.authorId.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">
              @{comment.authorId.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {renderCommentContent(comment.content)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto px-2 py-1"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageSquare className="mr-1 h-3 w-3" />
              {/* ✅ ADDED: Display the reply count if it's greater than 0 */}
              Reply
              {typeof comment.replyCount === "number" &&
                comment.replyCount > 0 && (
                  <span className="ml-1.5">({comment.replyCount})</span>
                )}
            </Button>
            {/* Logic for Edit/Delete on parent comment can be added here if needed */}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="pl-12 mt-4">
          <CommentForm
            eventId={eventId}
            parentId={comment._id}
            initialContent={replyContent}
            onFinished={() => setIsReplying(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8 space-y-4 border-l-2 ml-5">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="pl-5">
              <CommentItem
                comment={reply}
                eventId={eventId}
                parentCommentId={comment._id}
                onReplyClick={handleReplyClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
