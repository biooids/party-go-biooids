// FILE: src/components/pages/auth/ResetPassword.tsx (NEW FILE)

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPasswordMutation } from "@/lib/features/email/emailApiSlice";
import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "@/lib/schemas/auth.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { getApiErrorMessage } from "@/lib/utils";

const ResetPasswordComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setFormMessage({
        type: "error",
        text: "No reset token found. Please request a new link.",
      });
    }
  }, [token]);

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    if (!token) return;
    setFormMessage(null);
    try {
      const response = await resetPassword({
        token,
        newPassword: data.newPassword,
      }).unwrap();
      setFormMessage({ type: "success", text: response.message });
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err) {
      setFormMessage({ type: "error", text: getApiErrorMessage(err) });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Create a New Password
          </CardTitle>
          <CardDescription>
            Choose a strong, new password for your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {formMessage && (
              <Alert
                variant={
                  formMessage.type === "error" ? "destructive" : "default"
                }
                className={
                  formMessage.type === "success"
                    ? "border-green-500/50 text-green-700"
                    : ""
                }
              >
                {formMessage.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{formMessage.text}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  {...register("newPassword")}
                  disabled={
                    isLoading || !token || formMessage?.type === "success"
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-destructive text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                disabled={
                  isLoading || !token || formMessage?.type === "success"
                }
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading || !token || formMessage?.type === "success"}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Resetting...
                </>
              ) : (
                "Set New Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

// Use Suspense to handle client-side search parameter reading
export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
