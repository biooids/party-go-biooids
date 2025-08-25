// src/components/auth/AuthModal.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks";
import {
  closeAuthModal,
  selectAuthModalState,
} from "@/lib/features/ui/uiSlice";
import { Lock } from "lucide-react";

/**
 * A modal dialog that prompts unauthenticated users to log in or sign up
 * when they try to perform an action that requires authentication.
 */
export function AuthModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthModalOpen, interactionType } =
    useAppSelector(selectAuthModalState);

  const handleClose = () => dispatch(closeAuthModal());

  // A helper to navigate to the login or signup page and close the modal.
  const handleNavigate = (path: string) => {
    handleClose();
    router.push(path);
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader className="text-center items-center pt-2">
          <Lock className="h-8 w-8 mb-3 text-primary" />
          <DialogTitle className="text-lg">Authentication Required</DialogTitle>
          <DialogDescription className="text-xs px-2 leading-relaxed">
            Please log in or create an account to {interactionType}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <Button size="sm" onClick={() => handleNavigate("/auth/login")}>
            Log In
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleNavigate("/auth/signup")}
          >
            Sign Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
