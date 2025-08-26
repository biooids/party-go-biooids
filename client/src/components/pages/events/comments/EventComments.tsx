// src/components/pages/events/comments/EventComments.tsx

"use client";

import { useGetCommentsByEventIdQuery } from "@/lib/features/comment/commentApiSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";

export default function EventComments({ eventId }: { eventId: string }) {
  const { data, isLoading, isError } = useGetCommentsByEventIdQuery(eventId);

  const comments = data?.data.comments || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not load comments. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form for new top-level comments */}
      <CommentForm eventId={eventId} />
      <Separator />

      {/* List of existing comment threads */}
      <div className="space-y-8">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentThread
              key={comment._id}
              comment={comment}
              eventId={eventId}
            />
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}
