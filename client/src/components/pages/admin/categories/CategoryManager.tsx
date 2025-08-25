// src/components/pages/admin/categories/CategoryManager.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/lib/features/eventCategory/eventCategoryApiSlice";
import { EventCategory } from "@/lib/features/eventCategory/eventCategoryTypes";
import {
  createCategorySchema,
  CreateCategoryFormValues,
} from "@/lib/features/eventCategory/eventCategorySchemas";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ✅ REMOVED: All placeholder hooks are gone.

const CategoryForm = ({
  category,
  onFinished,
}: {
  category?: EventCategory | null;
  onFinished: () => void;
}) => {
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  const onSubmit = async (data: CreateCategoryFormValues) => {
    // The logic here remains the same, but now it calls the real mutations.
    const action = category
      ? updateCategory({ categoryId: category._id, body: data })
      : createCategory(data);

    toast.promise(action, {
      loading: category ? "Updating category..." : "Creating category...",
      success: `Category ${category ? "updated" : "created"} successfully!`,
      error: (err) =>
        err.data?.message ||
        `Failed to ${category ? "update" : "create"} category.`,
    });
    onFinished();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
        {errors.description && (
          <p className="text-destructive text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onFinished}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Category"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function CategoryManager({
  categories,
}: {
  categories: EventCategory[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);

  const [deleteCategory] = useDeleteCategoryMutation();

  const handleEdit = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    toast.promise(deleteCategory(selectedCategory._id), {
      loading: "Deleting category...",
      success: "Category deleted successfully.",
      error: (err) => err.data?.message || "Failed to delete category.",
    });
    setIsAlertOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Category
        </Button>
      </div>

      <div className="border rounded-lg">
        {categories.map((category) => (
          <div
            key={category._id}
            className="flex items-center justify-between p-4 border-b last:border-b-0"
          >
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteConfirm(category)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="p-4 text-center text-muted-foreground">
            No categories found. Create one to get started.
          </p>
        )}
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit" : "Create"} Category
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update the details for this category."
                : "Add a new category for events."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={selectedCategory}
            onFinished={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Alert for Delete */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this category?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Deleting this category might affect
              existing events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
