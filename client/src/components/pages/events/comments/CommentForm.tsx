// src/components/pages/events/comments/CommentForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  commentFormSchema,
  CommentFormValues,
} from "@/lib/features/comment/commentSchemas";
import { useCreateCommentMutation } from "@/lib/features/comment/commentApiSlice";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

interface CommentFormProps {
  eventId: string;
  parentId?: string | null;
  onCommentPosted?: () => void; // Optional callback to close a reply form
  placeholder?: string;
}

export default function CommentForm({
  eventId,
  parentId = null,
  onCommentPosted,
  placeholder = "Add a public comment...",
}: CommentFormProps) {
  const { user } = useAuth();
  const [createComment, { isLoading }] = useCreateCommentMutation();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (data: CommentFormValues) => {
    const promise = createComment({
      eventId,
      body: { content: data.content, parentId },
    }).unwrap();

    toast.promise(promise, {
      loading: "Posting comment...",
      success: () => {
        form.reset();
        onCommentPosted?.(); // Call the callback if it exists
        return "Comment posted!";
      },
      error: (err) => err.data?.message || "Failed to post comment.",
    });
  };

  if (!user) {
    return (
      <div className="text-sm text-center text-muted-foreground p-4 border rounded-lg">
        You must be logged in to comment.
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex items-start gap-4"
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
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Post
          </Button>
        </div>
      </div>
    </form>
  );
}
