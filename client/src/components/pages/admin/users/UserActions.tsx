// src/components/pages/admin/users/UserActions.tsx

"use client";

import { useState } from "react";
import { AdminUserView } from "@/lib/features/admin/adminTypes";
import { SystemRole } from "@/lib/features/auth/authTypes";
import {
  useDeleteUserMutation,
  useUnbanUserMutation,
  useUpdateUserRoleMutation,
  useRevokeCreatorStatusMutation, // ✅ 1. Import the new hook
} from "@/lib/features/admin/adminApiSlice";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Trash2,
  UserCog,
  ShieldOff,
  VenetianMask,
  UserX, // ✅ 2. Import a new icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BanUserDialog from "./BanUserDialog";
import { useAuth } from "@/lib/hooks/useAuth";

export default function UserActions({ user }: { user: AdminUserView }) {
  const { user: actor } = useAuth();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isRevokeAlertOpen, setIsRevokeAlertOpen] = useState(false); // ✅ 3. Add state for the new dialog

  const [updateUserRole] = useUpdateUserRoleMutation();
  const [unbanUser] = useUnbanUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [revokeCreatorStatus] = useRevokeCreatorStatusMutation(); // ✅ 4. Initialize the new hook

  const canPerformActions =
    actor &&
    user.systemRole !== SystemRole.SUPER_ADMIN &&
    actor._id !== user._id;

  const handleRoleChange = (systemRole: SystemRole) => {
    toast.promise(
      updateUserRole({ userId: user._id, body: { systemRole } }).unwrap(),
      {
        loading: "Updating role...",
        success: `User role updated to ${systemRole}.`,
        error: "Failed to update role.",
      }
    );
  };

  const handleUnban = () => {
    toast.promise(unbanUser(user._id).unwrap(), {
      loading: "Un-banning user...",
      success: "User has been un-banned.",
      error: "Failed to un-ban user.",
    });
  };

  const handleDelete = () => {
    toast.promise(deleteUser(user._id).unwrap(), {
      loading: "Deleting user...",
      success: "User has been permanently deleted.",
      error: "Failed to delete user.",
    });
    setIsDeleteAlertOpen(false);
  };

  // ✅ 5. Add a handler for the revoke action
  const handleRevoke = () => {
    toast.promise(revokeCreatorStatus(user._id).unwrap(), {
      loading: "Revoking creator status...",
      success: "Creator status has been revoked.",
      error: "Failed to revoke status.",
    });
    setIsRevokeAlertOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canPerformActions ? (
            <>
              {user.isBanned ? (
                <DropdownMenuItem onClick={handleUnban}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Un-ban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setIsBanDialogOpen(true)}>
                  <VenetianMask className="mr-2 h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}

              {/* ✅ 6. Conditionally render the revoke/verify actions */}
              {user.isVerifiedCreator && (
                <DropdownMenuItem onClick={() => setIsRevokeAlertOpen(true)}>
                  <UserX className="mr-2 h-4 w-4" />
                  Revoke Creator Status
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              {user.systemRole !== SystemRole.ADMIN ? (
                <DropdownMenuItem
                  onClick={() => handleRoleChange(SystemRole.ADMIN)}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Make Admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleRoleChange(SystemRole.USER)}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Make User
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setIsDeleteAlertOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <BanUserDialog
        user={user}
        isOpen={isBanDialogOpen}
        onOpenChange={setIsBanDialogOpen}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user and all their associated data from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ 7. Add the new confirmation dialog for revoking status */}
      <AlertDialog open={isRevokeAlertOpen} onOpenChange={setIsRevokeAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Creator Status?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the user's ability to create new events. They
              will have to apply for verification again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
