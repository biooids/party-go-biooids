// src/components/pages/profile/UserProfile.tsx

"use client";

// ✅ FIXED: Added the 'type' keyword to the import statement.
import type { UserProfile } from "@/lib/features/user/userTypes";
import type { SanitizedUserDto } from "@/lib/features/auth/authTypes";
import ProfileHeader from "./ProfileHeader";

interface UserProfileProps {
  user: UserProfile;
  currentUser: SanitizedUserDto | null;
}

export default function UserProfile({ user, currentUser }: UserProfileProps) {
  return (
    <ProfileHeader user={user} isMyProfile={false} currentUser={currentUser} />
  );
}
