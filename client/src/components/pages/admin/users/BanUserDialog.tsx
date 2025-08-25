// src/components/pages/admin/users/BanUserDialog.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { genericBanReasons } from "@/lib/data/moderation-reasons";
import { AdminUserView } from "@/lib/features/admin/adminTypes";
import { useBanUserMutation } from "@/lib/features/admin/adminApiSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const banFormSchema = z.object({
  banReason: z
    .string()
    .min(10, "A detailed reason of at least 10 characters is required."),
  bannedUntil: z.date().optional().nullable(),
});

type BanFormValues = z.infer<typeof banFormSchema>;

interface BanUserDialogProps {
  user: AdminUserView;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BanUserDialog({
  user,
  isOpen,
  onOpenChange,
}: BanUserDialogProps) {
  const [banUser, { isLoading }] = useBanUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BanFormValues>({
    resolver: zodResolver(banFormSchema),
  });

  const onSubmit = (data: BanFormValues) => {
    toast.promise(banUser({ userId: user._id, body: data }).unwrap(), {
      loading: "Banning user...",
      success: `User @${user.username} has been banned.`,
      error: "Failed to ban user.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User: @{user.username}</DialogTitle>
          <DialogDescription>
            Provide a reason for the ban. The user will see this reason if they
            attempt to log in. You can optionally set a date for the ban to
            expire.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Select a generic reason (optional)</Label>
            <Select onValueChange={(value) => setValue("banReason", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a quick reason..." />
              </SelectTrigger>
              <SelectContent>
                {genericBanReasons.map((reason, index) => (
                  <SelectItem key={index} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="banReason">Ban Reason</Label>
            <Textarea
              id="banReason"
              placeholder="Explain why this user is being banned..."
              {...register("banReason")}
            />
            {errors.banReason && (
              <p className="text-destructive text-sm mt-1">
                {errors.banReason.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="bannedUntil">Ban Expires On (optional)</Label>
            <Input
              id="bannedUntil"
              type="date"
              {...register("bannedUntil", { valueAsDate: true })}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Banning..." : "Confirm Ban"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
