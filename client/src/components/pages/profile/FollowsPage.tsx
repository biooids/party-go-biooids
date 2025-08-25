// src/components/pages/profile/FollowsPage.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FollowUser } from "@/lib/features/user/userTypes";

// A reusable component to display a list of users
const UserList = ({
  users,
  isLoading,
  emptyMessage,
}: {
  users?: FollowUser[];
  isLoading: boolean;
  emptyMessage: string;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Link
          key={user._id} // Use _id for the key
          href={`/profile/${user.username}`}
          className="flex items-center gap-4 p-2 -m-2 rounded-lg transition-colors hover:bg-muted"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImage || undefined} />
            <AvatarFallback>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

interface FollowsPageProps {
  username: string;
  initialTab: "followers" | "following";
  followersData?: FollowUser[];
  followingData?: FollowUser[];
  isFollowersLoading: boolean;
  isFollowingLoading: boolean;
}

export default function FollowsPage({
  username,
  initialTab,
  followersData,
  followingData,
  isFollowersLoading,
  isFollowingLoading,
}: FollowsPageProps) {
  return (
    <Tabs defaultValue={initialTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="followers">Followers</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>
      <TabsContent value="followers">
        <Card>
          <CardContent className="pt-6">
            <UserList
              users={followersData}
              isLoading={isFollowersLoading}
              emptyMessage={`@${username} has no followers yet.`}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="following">
        <Card>
          <CardContent className="pt-6">
            <UserList
              users={followingData}
              isLoading={isFollowingLoading}
              emptyMessage={`@${username} isn't following anyone yet.`}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
