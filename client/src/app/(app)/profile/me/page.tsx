// src/app/(app)/profile/me/page.tsx

"use client";

import { useGetMeQuery } from "@/lib/features/user/userApiSlice";
import { useAuth } from "@/lib/hooks/useAuth";
import MyProfile from "@/components/pages/profile/MyProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export default function MyProfilePage() {
  const router = useRouter();
  const { token } = useAuth();

  const { data, isLoading, isError, isFetching } = useGetMeQuery(undefined, {
    skip: !token, // Only run the query if the user has a token
  });

  // This effect handles redirecting unauthenticated users
  useEffect(() => {
    if (!token && !isFetching) {
      router.push("/auth/login");
    }
  }, [token, isFetching, router]);

  // Show a skeleton while the initial token check or data fetch is in progress
  if (isLoading || isFetching || !token) {
    return <ProfileSkeleton />;
  }

  if (isError || !data?.data?.user) {
    return (
      <div className="container flex justify-center py-10">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Profile</AlertTitle>
          <AlertDescription>
            We couldn't load your profile data. Please try logging in again.
          </AlertDescription>
          <Button asChild className="mt-4">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Link>
          </Button>
        </Alert>
      </div>
    );
  }

  // Once data is loaded, render the editable MyProfile component
  return <MyProfile user={data.data.user} />;
}
