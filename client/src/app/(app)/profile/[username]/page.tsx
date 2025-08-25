// src/app/(app)/profile/[username]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useGetUserByUsernameQuery } from "@/lib/features/user/userApiSlice";
import { useAuth } from "@/lib/hooks/useAuth";
import UserProfile from "@/components/pages/profile/UserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ProfileSkeleton = () => (
  <div className="container mx-auto max-w-4xl py-8">
    <Skeleton className="h-48 w-full" />
    <div className="-mt-16 ml-6">
      <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
      <Skeleton className="h-8 w-48 mt-4" />
      <Skeleton className="h-5 w-32 mt-2" />
    </div>
  </div>
);

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  // ✅ SECURITY: If a logged-in user tries to view their own public profile,
  // redirect them to the secure '/profile/me' page instead.
  useEffect(() => {
    if (currentUser?.username === username) {
      router.replace("/profile/me");
    }
  }, [currentUser, username, router]);

  const {
    data: profileData,
    isLoading,
    isError,
  } = useGetUserByUsernameQuery(username, {
    skip: !username || currentUser?.username === username, // Skip if it's our own profile
  });

  // Don't render anything for the split-second a redirect might be happening
  if (currentUser?.username === username) {
    return <ProfileSkeleton />;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profileData?.data?.user) {
    return (
      <div className="container flex justify-center py-10">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>User Not Found</AlertTitle>
          <AlertDescription>
            The profile for @{username} does not exist.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // This component now only ever shows the public, read-only view.
  return <UserProfile user={profileData.data.user} currentUser={currentUser} />;
}
