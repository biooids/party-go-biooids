//src/components/pages/events/comments/CommentForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  commentFormSchema,
  CommentFormValues,
} from "@/lib/features/comment/commentSchemas";
import {
  useCreateCommentMutation,
  useUpdateCommentMutation,
} from "@/lib/features/comment/commentApiSlice";
import { cn } from "@/lib/utils";
import { Comment } from "@/lib/features/comment/commentTypes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

const MAX_COMMENT_LENGTH = 1000;

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

interface CommentFormProps {
  eventId: string;
  commentToEdit?: Comment;
  parentId?: string | null;
  initialContent?: string;
  onFinished?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  eventId,
  commentToEdit,
  parentId = null,
  initialContent = "",
  onFinished,
  placeholder = "Add a public comment...",
}: CommentFormProps) {
  const { user } = useAuth();
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const isLoading = isCreating || isUpdating;

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: commentToEdit?.content || initialContent,
    },
  });

  const contentValue = form.watch("content");
  const remainingChars = MAX_COMMENT_LENGTH - contentValue.length;

  const onSubmit = (data: CommentFormValues) => {
    // ✅ FIXED: Handle each case (edit vs. create) in a separate block.
    if (commentToEdit) {
      // This is an update action
      toast.promise(
        updateComment({
          commentId: commentToEdit._id,
          content: data.content,
        }).unwrap(),
        {
          loading: "Updating comment...",
          success: () => {
            onFinished?.();
            return "Comment updated!";
          },
          error: (err) => err.data?.message || "Failed to update comment.",
        }
      );
    } else {
      // This is a create action
      toast.promise(
        createComment({
          eventId,
          body: { content: data.content, parentId },
        }).unwrap(),
        {
          loading: "Posting comment...",
          success: () => {
            form.reset({ content: "" });
            onFinished?.();
            return "Comment posted!";
          },
          error: (err) => err.data?.message || "Failed to post comment.",
        }
      );
    }
  };

  if (!user) return null;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex items-start gap-4 w-full"
    >
      <Avatar className="hidden sm:block">
        <AvatarImage src={user.profileImage ?? ""} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder={placeholder}
          {...form.register("content")}
          className="min-h-[60px]"
          maxLength={MAX_COMMENT_LENGTH}
        />
        <div className="flex justify-between items-center">
          <p
            className={cn(
              "text-xs",
              remainingChars < 20 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {remainingChars} characters remaining
          </p>
          <div className="flex gap-2">
            {commentToEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onFinished}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading} size="sm">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {commentToEdit ? "Save" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
