// src/components/auth/SignUpForm.tsx

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

// --- Custom Imports for our App ---
import { useSignupMutation } from "@/lib/features/auth/authApiSlice";
import {
  signUpSchema,
  SignUpFormValues,
} from "@/lib/features/auth/auth.schemas";
import { useFocusOnError } from "@/lib/hooks/useFocusOnError";
import { cn } from "@/lib/utils";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import SocialLogin from "./SocialLogin"; // Placeholder for OAuth buttons

// --- Helper Components ---
const PasswordStrengthIndicator = ({ score }: { score: number }) => {
  const levels = [
    { color: "bg-muted", width: "w-1/4" },
    { color: "bg-muted", width: "w-1/4" },
    { color: "bg-muted", width: "w-1/4" },
    { color: "bg-muted", width: "w-1/4" },
  ];
  if (score >= 1) levels[0].color = "bg-red-500";
  if (score >= 2) levels[1].color = "bg-orange-500";
  if (score >= 3) levels[2].color = "bg-yellow-500";
  if (score >= 4) levels[3].color = "bg-green-500";
  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-1">
      {levels.map((level, index) => (
        <div
          key={index}
          className={cn("h-full transition-colors", level.width, level.color)}
        />
      ))}
    </div>
  );
};

// --- Main Component ---
const SignUpForm = () => {
  const router = useRouter();
  const [signup, { isLoading }] = useSignupMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setFocus,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  useFocusOnError(errors, setFocus);
  const currentPassword = watch("password", "");

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (currentPassword.length >= 8) score++;
    if (/\d/.test(currentPassword)) score++;
    if (/[a-z]/.test(currentPassword) && /[A-Z]/.test(currentPassword)) score++;
    if (/[^A-Za-z0-9]/.test(currentPassword)) score++;
    if (score >= 4)
      return { label: "Very Strong", score: 4, color: "text-green-500" };
    if (score === 3)
      return { label: "Strong", score: 3, color: "text-yellow-500" };
    if (score === 2)
      return { label: "Medium", score: 2, color: "text-orange-500" };
    return { label: "Weak", score: score, color: "text-red-500" };
  }, [currentPassword]);

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    setFormError(null);
    try {
      await signup({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      }).unwrap();
      // On success, RTK Query's onQueryStarted handles setting credentials.
      // We can now navigate the user to the home page.
      router.push("/");
    } catch (err: any) {
      // Extract the error message from the RTK Query error response.
      const errorMessage = err.data?.message || "An unexpected error occurred.";
      setFormError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Create Your Account
          </CardTitle>
          <CardDescription>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            {/* Form Fields: Name, Username, Email, Password, Confirm Password, Accept Terms */}
            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-destructive text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              {currentPassword && (
                <PasswordStrengthIndicator score={passwordStrength.score} />
              )}
              {errors.password && (
                <p className="text-destructive text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            {/* Accept Terms */}
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="acceptTerms">
                      I accept the{" "}
                      <Link
                        href="/terms"
                        className="text-primary hover:underline"
                      >
                        Terms of Service
                      </Link>
                    </Label>
                  </div>
                  {error && (
                    <p className="text-destructive text-xs mt-1">
                      {error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUpForm;
