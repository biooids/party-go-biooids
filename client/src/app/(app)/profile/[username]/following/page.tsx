//src/app/(app)/profile/[username]/following/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useGetFollowingQuery } from "@/lib/features/user/userApiSlice";
import FollowsPage from "@/components/pages/profile/FollowsPage";

export default function FollowingPage() {
  const params = useParams();
  const username = params.username as string;

  // Fetch the following data using the new hook
  const { data, isLoading } = useGetFollowingQuery(username, {
    skip: !username,
  });

  return (
    <FollowsPage
      username={username}
      initialTab="following"
      followingData={data?.data.users}
      isFollowingLoading={isLoading}
      followersData={[]}
      isFollowersLoading={false}
    />
  );
}
