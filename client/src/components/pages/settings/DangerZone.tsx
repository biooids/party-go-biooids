"use client";

import { useState } from "react";
import { useDeleteAccountMutation } from "@/lib/features/user/userApiSlice";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ✅ 1. Import the Input component
import { Label } from "@/components/ui/label"; // ✅ 2. Import the Label component
import { Trash2, Loader2 } from "lucide-react";

export default function DangerZone() {
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  // ✅ 3. Add state to manage the dialog's input and open state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");

  const handleDelete = async () => {
    if (confirmationInput !== "DELETE") {
      toast.error("Confirmation text does not match.");
      return;
    }

    try {
      await deleteAccount().unwrap();
      toast.success("Account deleted successfully.");
      // The onQueryStarted logic handles logging out, and a protected route
      // component will handle the redirect.
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Failed to delete account. Please try again.");
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          These actions are permanent and cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-dashed border-destructive p-4">
          <div>
            <h4 className="font-semibold text-destructive">Delete Account</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all of your data.
            </p>
          </div>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. To confirm, please type{" "}
                  <strong className="text-foreground">DELETE</strong> in the box
                  below.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {/* ✅ 4. Add the confirmation input field */}
              <div className="py-2">
                <Label htmlFor="delete-confirm" className="sr-only">
                  Confirm Deletion
                </Label>
                <Input
                  id="delete-confirm"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  autoComplete="off"
                  className="border-destructive focus-visible:ring-destructive"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmationInput("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  // ✅ 5. The button is disabled until the user types "DELETE"
                  disabled={isLoading || confirmationInput !== "DELETE"}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
