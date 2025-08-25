// src/components/pages/profile/MyProfile.tsx

"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/features/user/userTypes"; // ✅ CHANGED: Expect the full UserProfile
import ProfileHeader from "./ProfileHeader";
import EditProfileForm from "./EditProfileForm";

export default function MyProfile({ user }: { user: UserProfile }) {
  const [isEditing, setIsEditing] = useState(false);

  // If the user is in editing mode, show the form
  if (isEditing) {
    return (
      <EditProfileForm
        user={user}
        onFinishEditing={() => setIsEditing(false)}
      />
    );
  }

  return (
    <ProfileHeader
      user={user}
      isMyProfile={true}
      onEdit={() => setIsEditing(true)}
    />
  );
}
