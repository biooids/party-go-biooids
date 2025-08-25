//src/components/pages/events/CreateEventForm.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createEventSchema,
  CreateEventFormValues,
} from "@/lib/features/event/eventSchemas";
import { useCreateEventMutation } from "@/lib/features/event/eventApiSlice";
import { useGetAllCategoriesQuery } from "@/lib/features/eventCategory/eventCategoryApiSlice";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X, ImagePlus } from "lucide-react";

const MAX_IMAGES = 5;

export default function CreateEventForm() {
  const router = useRouter();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    // ✅ 1. REMOVED the explicit <CreateEventFormValues> generic type
    resolver: zodResolver(createEventSchema),
    // ✅ 2. ADDED a complete defaultValues object.
    // This allows TypeScript to correctly infer the form's type from the schema.
    defaultValues: {
      name: "",
      description: "",
      address: "",
      date: "",
      price: 0,
      categoryId: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

    if (imageFiles.length + newFiles.length > MAX_IMAGES) {
      toast.error(`You can only upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // This SubmitHandler now works perfectly because useForm's type is correctly inferred.
  const onSubmit: SubmitHandler<CreateEventFormValues> = async (data) => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one event image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("address", data.address);
    formData.append("date", data.date);
    formData.append("price", data.price.toString());
    formData.append("categoryId", data.categoryId);

    imageFiles.forEach((file) => {
      formData.append("eventImages", file);
    });

    toast.promise(createEvent(formData).unwrap(), {
      loading: "Submitting your event for approval...",
      success: (newEvent) => {
        router.push(`/events/${newEvent._id}`);
        return "Event submitted successfully! It is now pending approval.";
      },
      error: (err) => err.data?.message || "Failed to create event.",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side: Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Event Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address / Venue</Label>
              <Input id="address" {...register("address")} />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date & Time</Label>
                <Input id="date" type="datetime-local" {...register("date")} />
                {errors.date && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.data.categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          {/* Right Side: Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images">Event Images (up to {MAX_IMAGES})</Label>
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={src}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {imageFiles.length < MAX_IMAGES && (
                <Label
                  htmlFor="images"
                  className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">
                    Add Image
                  </span>
                </Label>
              )}
            </div>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Approval
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
