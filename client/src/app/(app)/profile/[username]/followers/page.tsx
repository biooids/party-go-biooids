//src/app/(app)/profile/[username]/followers/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useGetFollowersQuery } from "@/lib/features/user/userApiSlice";
import FollowsPage from "@/components/pages/profile/FollowsPage";

export default function FollowersPage() {
  const params = useParams();
  const username = params.username as string;

  // Fetch the followers data using the new hook
  const { data, isLoading } = useGetFollowersQuery(username, {
    skip: !username,
  });

  return (
    <FollowsPage
      username={username}
      initialTab="followers"
      followersData={data?.data.users}
      isFollowersLoading={isLoading}
      followingData={[]}
      isFollowingLoading={false}
    />
  );
}
