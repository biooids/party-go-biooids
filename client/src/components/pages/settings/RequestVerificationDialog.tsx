"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createVerificationRequestSchema,
  CreateVerificationRequestFormValues,
} from "@/lib/features/verificationRequest/verificationRequestSchemas";
import { useSubmitVerificationRequestMutation } from "@/lib/features/verificationRequest/verificationRequestApiSlice";
import { useGetAllCategoriesQuery } from "@/lib/features/eventCategory/eventCategoryApiSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface RequestVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestVerificationDialog({
  isOpen,
  onOpenChange,
}: RequestVerificationDialogProps) {
  const [submitRequest, { isLoading }] = useSubmitVerificationRequestMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateVerificationRequestFormValues>({
    resolver: zodResolver(createVerificationRequestSchema),
    defaultValues: {
      reason: "",
      location: "",
      preferredCategories: [],
    },
  });

  const onSubmit = (data: CreateVerificationRequestFormValues) => {
    toast.promise(submitRequest(data).unwrap(), {
      loading: "Submitting your request...",
      success: "Your request has been submitted for review!",
      error: (err) => err.data?.message || "Failed to submit request.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to be a Creator</DialogTitle>
          <DialogDescription>
            Fill out the form below. Our team will review your application and
            get back to you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="location">Your Location</Label>
            <Input
              id="location"
              placeholder="e.g., Kigali, Rwanda"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-destructive text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
          <div>
            <Label>Preferred Event Categories</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select the type of events you plan to host.
            </p>
            <Controller
              name="preferredCategories"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {categoriesData?.data.categories.map((category) => (
                    <div key={category._id} className="flex items-center gap-2">
                      <Checkbox
                        id={category._id}
                        checked={field.value?.includes(category._id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, category._id])
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== category._id
                                )
                              );
                        }}
                      />
                      <Label htmlFor={category._id}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.preferredCategories && (
              <p className="text-destructive text-sm mt-1">
                {errors.preferredCategories.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="reason">Reason for Applying</Label>
            <Textarea
              id="reason"
              placeholder="Tell us about the events you want to create..."
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-destructive text-sm mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
