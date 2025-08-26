"use client";

import Image from "next/image";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Event } from "@/lib/features/event/eventTypes";
import {
  updateEventSchema,
  UpdateEventFormValues,
} from "@/lib/features/event/eventSchemas";
import { useUpdateEventMutation } from "@/lib/features/event/eventApiSlice";
import { useGetAllCategoriesQuery } from "@/lib/features/eventCategory/eventCategoryApiSlice";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditEventFormProps {
  event: Event;
  onFinished: () => void;
}

export default function EditEventForm({
  event,
  onFinished,
}: EditEventFormProps) {
  const [updateEvent, { isLoading }] = useUpdateEventMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      name: event.name || "",
      description: event.description || "",
      address: event.address || "",
      date: event.date ? new Date(event.date) : undefined,
      time: event.date ? format(new Date(event.date), "HH:mm") : "",
      price: event.price || 0,
      categoryId: event.categoryId?._id || "",
    },
  });

  const onSubmit: SubmitHandler<UpdateEventFormValues> = async (data) => {
    if (!data.date || !data.time) {
      toast.error("A valid date and time must be provided.");
      return;
    }

    const [hours, minutes] = data.time.split(":").map(Number);
    const combinedDate = new Date(data.date);
    combinedDate.setHours(hours, minutes);

    const payload = {
      ...data,
      date: combinedDate.toISOString(),
    };

    toast.promise(updateEvent({ eventId: event._id, body: payload }).unwrap(), {
      loading: "Saving changes...",
      success: "Event updated successfully!",
      error: (err) => err.data?.message || "Failed to update event.",
    });
    onFinished();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4">
      {/* Form Fields */}
      <div>
        <Label htmlFor="name">Event Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-sm text-destructive mt-1">
              {errors.date.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input id="time" type="time" {...register("time")} />
          {errors.time && (
            <p className="text-sm text-destructive mt-1">
              {errors.time.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="price">Price ($)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          placeholder="0.00 for free events"
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price && (
          <p className="text-sm text-destructive mt-1">
            {errors.price.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

      <div className="space-y-2">
        <Label>Event Images</Label>
        <div className="grid grid-cols-5 gap-2">
          {event.imageUrls.map((url) => (
            <div key={url} className="relative aspect-square">
              <Image
                src={url}
                alt="Event image"
                fill
                className="object-cover rounded-md"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Image editing is not available in this version.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onFinished}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
