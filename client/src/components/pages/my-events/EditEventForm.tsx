"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Event, UpdateEventDto } from "@/lib/features/event/eventTypes";
import {
  updateEventSchema,
  UpdateEventFormValues,
} from "@/lib/features/event/eventSchemas";
import { useUpdateEventMutation } from "@/lib/features/event/eventApiSlice";
import { useGetAllCategoriesQuery } from "@/lib/features/eventCategory/eventCategoryApiSlice";
import { useLazyGeocodeAddressQuery } from "@/lib/features/map/mapApiSlice";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { MapPlaceFeature } from "@/lib/features/map/mapTypes";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  Calendar as CalendarIcon,
  MapPin,
  X,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Map from "@/components/pages/map/Map";
import { Marker } from "react-map-gl";

const MAX_IMAGES = 5;

interface EditEventFormProps {
  event: Event;
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [updateEvent, { isLoading }] = useUpdateEventMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const [viewState, setViewState] = useState({
    longitude: event.location.coordinates[0],
    latitude: event.location.coordinates[1],
    zoom: 15,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [triggerGeocode, { data: geocodeData, isFetching: isGeocoding }] =
    useLazyGeocodeAddressQuery();
  const [selectedLocation, setSelectedLocation] =
    useState<MapPlaceFeature | null>(null);

  // ✅ ADDED: State to manage image updates
  const [existingImages, setExistingImages] = useState(event.imageUrls);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
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

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length > 2) {
      triggerGeocode({ query: debouncedSearchQuery });
    }
  }, [debouncedSearchQuery, triggerGeocode]);

  const handleLocationSelect = (location: MapPlaceFeature) => {
    setSelectedLocation(location);
    setValue("address", location.place_name, { shouldValidate: true });
    setViewState({
      longitude: location.center[0],
      latitude: location.center[1],
      zoom: 15,
    });
    setSearchQuery("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (
      existingImages.length + newImageFiles.length + newFiles.length >
      MAX_IMAGES
    ) {
      toast.error(`You can only have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setNewImageFiles((prev) => [...prev, ...newFiles]);
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingImage = (urlToRemove: string) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    URL.revokeObjectURL(newImagePreviews[indexToRemove]);
    setNewImageFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setNewImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const onSubmit: SubmitHandler<UpdateEventFormValues> = async (data) => {
    // NOTE: This requires a backend update to handle FormData for event updates.
    const formData = new FormData();
    // Append text fields that have values
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.address) formData.append("address", data.address);
    if (data.price !== undefined)
      formData.append("price", data.price.toString());
    if (data.categoryId) formData.append("categoryId", data.categoryId);

    if (data.date && data.time) {
      const [hours, minutes] = data.time.split(":").map(Number);
      const combinedDate = new Date(data.date);
      combinedDate.setHours(hours, minutes);
      formData.append("date", combinedDate.toISOString());
    }

    // Append image data
    formData.append("existingImageUrls", JSON.stringify(existingImages));
    newImageFiles.forEach((file) => {
      formData.append("newImages", file);
    });

    toast.promise(
      updateEvent({ eventId: event._id, body: formData }).unwrap(),
      {
        loading: "Saving changes...",
        success: () => {
          router.push(`/my-events/${event._id}`);
          router.refresh();
          return "Event updated successfully!";
        },
        error: (err) => err.data?.message || "Failed to update event.",
      }
    );
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
            <div className="space-y-2">
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

          {/* Right Side: Map and Images */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Location Preview</Label>
              <div className="h-48 w-full rounded-lg overflow-hidden border">
                <Map
                  viewState={viewState}
                  onMove={(evt) => setViewState(evt.viewState)}
                >
                  <Marker
                    longitude={viewState.longitude}
                    latitude={viewState.latitude}
                  >
                    <MapPin className="h-6 w-6 text-red-500" />
                  </Marker>
                </Map>
              </div>
            </div>
            {/* ✅ ADDED: Full image management UI */}
            <div className="space-y-2">
              <Label>Event Images (up to {MAX_IMAGES})</Label>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((url) => (
                  <div key={url} className="relative aspect-square">
                    <Image
                      src={url}
                      alt="Existing event image"
                      fill
                      className="object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveExistingImage(url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {newImagePreviews.map((src, index) => (
                  <div key={src} className="relative aspect-square">
                    <Image
                      src={src}
                      alt={`New preview ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {existingImages.length + newImageFiles.length < MAX_IMAGES && (
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
