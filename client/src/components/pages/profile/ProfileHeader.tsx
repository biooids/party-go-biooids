// src/components/pages/profile/ProfileHeader.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserProfile, CurrentUser } from "@/lib/features/user/userTypes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, ImageIcon, Calendar, MapPin } from "lucide-react";
import FollowButton from "./FollowButton";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

interface ProfileHeaderProps {
  user: UserProfile;
  isMyProfile: boolean;
  currentUser?: CurrentUser | null;
  onEdit?: () => void;
}

export default function ProfileHeader({
  user,
  isMyProfile,
  currentUser,
  onEdit,
}: ProfileHeaderProps) {
  // ✅ 4. State to manage the banner's loading status for a smooth transition
  const [isBannerLoading, setBannerLoading] = useState(true);

  return (
    <Card className="overflow-hidden">
      {/* Banner Image */}
      <div className="relative h-64 w-full bg-muted">
        {user.bannerImage ? (
          <>
            {isBannerLoading && <Skeleton className="h-full w-full" />}
            <Image
              src={user.bannerImage}
              alt={`${user.name}'s banner`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover duration-700 ease-in-out",
                isBannerLoading
                  ? "grayscale blur-xl scale-110"
                  : "grayscale-0 blur-0 scale-100"
              )}
              onLoad={() => setBannerLoading(false)}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <CardContent className="p-6 pt-0">
        {/* Avatar & Action Buttons */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <Avatar className="-mt-16 h-32 w-32 shrink-0 border-4 border-background">
            <AvatarImage
              src={user.profileImage ?? ""}
              alt={user.name ?? "User"}
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="mt-4 flex w-full items-center justify-end gap-2 sm:w-auto">
            {isMyProfile ? (
              <Button onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            ) : (
              <FollowButton
                profileUser={user}
                currentUser={currentUser ?? null}
              />
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-4 max-w-2xl">{user.bio}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {user.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Joined{" "}
              {format(new Date(user.createdAt), "MMMM yyyy")}
            </div>

            <Link
              href={`/profile/${user.username}/following`}
              className="flex items-center gap-2 hover-text-primary"
            >
              <span className="font-semibold text-foreground">
                {user.followingCount}
              </span>
              Following
            </Link>
            <Link
              href={`/profile/${user.username}/followers`}
              className="flex items-center gap-2 hover-text-primary"
            >
              <span className="font-semibold text-foreground">
                {user.followersCount}
              </span>
              Followers
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
