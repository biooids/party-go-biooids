// src/components/pages/profile/FollowButton.tsx

"use client";

import React from "react";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/lib/features/user/userApiSlice";
import { UserProfile, CurrentUser } from "@/lib/features/user/userTypes";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  profileUser: UserProfile;
  currentUser: CurrentUser | null;
}

export default function FollowButton({
  profileUser,
  currentUser,
}: FollowButtonProps) {
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] =
    useUnfollowUserMutation();

  // A user cannot follow themselves, and guests can't follow anyone.
  if (!currentUser || currentUser._id === profileUser._id) {
    return null;
  }

  const isLoading = isFollowing || isUnfollowing;

  const handleFollow = async () => {
    try {
      await followUser(profileUser.username).unwrap();
      toast.success(`You are now following @${profileUser.username}`);
    } catch (error) {
      toast.error("Failed to follow user.");
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(profileUser.username).unwrap();
      toast.success(`You have unfollowed @${profileUser.username}`);
    } catch (error) {
      toast.error("Failed to unfollow user.");
    }
  };

  if (profileUser.isFollowing) {
    return (
      <Button variant="outline" onClick={handleUnfollow} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserMinus className="mr-2 h-4 w-4" />
        )}
        Unfollow
      </Button>
    );
  }

  return (
    <Button onClick={handleFollow} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      Follow
    </Button>
  );
}
