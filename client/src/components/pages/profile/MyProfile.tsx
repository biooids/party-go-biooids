// src/components/pages/profile/MyProfile.tsx

"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/features/user/userTypes";
import ProfileHeader from "./ProfileHeader";
import EditProfileForm from "./EditProfileForm";

// ✅ ADDED: Imports for the new "nudge" component UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function MyProfile({ user }: { user: UserProfile }) {
  const [isEditing, setIsEditing] = useState(false);

  // ✅ ADDED: Logic to detect if the user has a default, auto-generated profile.
  // This is true if their name and username are still the same.
  const isDefaultProfile = user.name === user.username;

  // If the user is in editing mode, show the form.
  if (isEditing) {
    return (
      <EditProfileForm
        user={user}
        onFinishEditing={() => setIsEditing(false)}
      />
    );
  }

  // ✅ CHANGED: The main return now includes the conditional nudge.
  return (
    <div className="space-y-6">
      {/* This card will only appear if the user has a default profile 
        and is NOT currently in editing mode.
      */}
      {isDefaultProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to PartyGo! 🎉</CardTitle>
            <CardDescription>
              Your account is ready. Take a moment to choose a personalized name
              and username.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsEditing(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Complete Your Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* The main profile header is still displayed. */}
      <ProfileHeader
        user={user}
        isMyProfile={true}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
