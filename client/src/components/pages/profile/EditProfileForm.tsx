//src/components/pages/profile/EditProfileForm.tsx

"use client";

import { useState, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProfileMutation } from "@/lib/features/user/userApiSlice";
import {
  updateUserSchema,
  UpdateUserFormValues,
} from "@/lib/features/user/user.schemas";
import { SanitizedUserDto } from "@/lib/features/auth/authTypes";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, Save, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

interface EditProfileFormProps {
  user: SanitizedUserDto;
  onFinishEditing: () => void;
}

export default function EditProfileForm({
  user,
  onFinishEditing,
}: EditProfileFormProps) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState(user.profileImage);
  const [bannerPreview, setBannerPreview] = useState(user.bannerImage);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch, // ✅ 1. Import the 'watch' function
    formState: { errors, isDirty },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "", // ✅ 2. Add location to default values
    },
  });

  // ✅ 3. Watch the fields to get their current character count
  const bioValue = watch("bio") || "";
  const locationValue = watch("location") || "";

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "profile") {
        setProfileImageFile(file);
        setProfilePreview(URL.createObjectURL(file));
      } else {
        setBannerImageFile(file);
        setBannerPreview(URL.createObjectURL(file));
      }
    }
  };

  const onSubmit: SubmitHandler<UpdateUserFormValues> = async (data) => {
    const formData = new FormData();
    const hasTextChanged = isDirty;
    const hasFilesChanged = profileImageFile || bannerImageFile;

    if (!hasTextChanged && !hasFilesChanged) {
      toast.info("No changes to save.");
      onFinishEditing();
      return;
    }

    // Append changed text fields
    if (data.name !== user.name) formData.append("name", data.name || "");
    if (data.username !== user.username)
      formData.append("username", data.username || "");
    if (data.bio !== user.bio) formData.append("bio", data.bio || "");
    if (data.location !== user.location)
      formData.append("location", data.location || ""); // ✅ 4. Append location

    // Append image files if they exist
    if (profileImageFile) formData.append("profileImage", profileImageFile);
    if (bannerImageFile) formData.append("bannerImage", bannerImageFile);

    try {
      await updateProfile(formData).unwrap();
      toast.success("Profile updated successfully!");
      onFinishEditing();
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to update profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Make changes to your public profile. Click save when you're done.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload UI */}
          <div>
            <Label>Banner Image</Label>
            <div className="relative mt-2 h-48 w-full bg-muted rounded-md flex items-center justify-center">
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt="Banner"
                  className="absolute h-full w-full object-cover rounded-md"
                />
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => bannerInputRef.current?.click()}
                className="z-10"
              >
                <Camera className="mr-2 h-4 w-4" /> Change Banner
              </Button>
              <input
                type="file"
                className="hidden"
                ref={bannerInputRef}
                onChange={(e) => handleFileChange(e, "banner")}
                accept="image/*"
              />
            </div>
          </div>
          <div>
            <Label>Profile Image</Label>
            <div className="mt-2 flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePreview ?? ""} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                onClick={() => profileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" /> Change Avatar
              </Button>
              <input
                type="file"
                className="hidden"
                ref={profileInputRef}
                onChange={(e) => handleFileChange(e, "profile")}
                accept="image/*"
              />
            </div>
          </div>

          {/* Text Fields */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} disabled={isLoading} />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-destructive text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            {/* ✅ 5. Add character counter for Bio */}
            <div className="flex justify-between items-center">
              <Label htmlFor="bio">Bio</Label>
              <span
                className={cn(
                  "text-xs",
                  bioValue.length > 250
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {bioValue.length} / 250
              </span>
            </div>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell us a little about yourself"
              disabled={isLoading}
              maxLength={250}
            />
            {errors.bio && (
              <p className="text-destructive text-xs mt-1">
                {errors.bio.message}
              </p>
            )}
          </div>
          <div>
            {/* ✅ 6. Add Location field with character counter */}
            <div className="flex justify-between items-center">
              <Label htmlFor="location">Location</Label>
              <span
                className={cn(
                  "text-xs",
                  locationValue.length > 100
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {locationValue.length} / 100
              </span>
            </div>
            <Input
              id="location"
              {...register("location")}
              placeholder="e.g., Kigali, Rwanda"
              disabled={isLoading}
              maxLength={100}
            />
            {errors.location && (
              <p className="text-destructive text-xs mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onFinishEditing}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
