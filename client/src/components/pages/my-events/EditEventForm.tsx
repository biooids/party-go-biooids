"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  updateEventSchema,
  UpdateEventFormValues, // ✅ 1. Use the correct exported type
} from "@/lib/features/event/eventSchemas";
import { Event } from "@/lib/features/event/eventTypes";
import { useUpdateEventMutation } from "@/lib/features/event/eventApiSlice";
import { useGetAllCategoriesQuery } from "@/lib/features/eventCategory/eventCategoryApiSlice";
import {
  useLazyGeocodeAddressQuery,
  useLazyReverseGeocodeQuery,
} from "@/lib/features/map/mapApiSlice";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { MapPlaceFeature } from "@/lib/features/map/mapTypes";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";

// Icons & Map
import {
  Loader2,
  X,
  ImagePlus,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
} from "lucide-react";
import Map from "@/components/pages/map/Map";
import {
  Marker,
  type ViewStateChangeEvent,
  type MapMouseEvent,
} from "react-map-gl";

const MAX_IMAGES = 5;
const MAX_DESC_LENGTH = 500; // ✅ 2. Define the missing constant

interface EditEventFormProps {
  event: Event;
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [updateEvent, { isLoading }] = useUpdateEventMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();

  // State for image updates
  const [existingImages, setExistingImages] = useState(event.imageUrls);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // State for map and location search
  const [viewState, setViewState] = useState({
    longitude: event.location.coordinates[0],
    latitude: event.location.coordinates[1],
    zoom: 15,
  });
  const [searchQuery, setSearchQuery] = useState(event.address);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [triggerGeocode, { data: geocodeData, isFetching: isGeocoding }] =
    useLazyGeocodeAddressQuery();
  const [triggerReverseGeocode, { isFetching: isReverseGeocoding }] =
    useLazyReverseGeocodeQuery();
  const [showResults, setShowResults] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateEventFormValues>({
    // ✅ 1. Use the correct type here as well
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

  const descriptionValue = watch("description", "");

  useEffect(() => {
    if (
      debouncedSearchQuery &&
      debouncedSearchQuery.length > 2 &&
      debouncedSearchQuery !== event.address
    ) {
      triggerGeocode({
        query: debouncedSearchQuery,
        lng: viewState.longitude,
        lat: viewState.latitude,
      });
    }
  }, [
    debouncedSearchQuery,
    triggerGeocode,
    viewState.longitude,
    viewState.latitude,
    event.address,
  ]);

  const handleLocationSelect = (location: MapPlaceFeature) => {
    setValue("address", location.place_name, { shouldValidate: true });
    setSearchQuery(location.place_name);
    setViewState({
      longitude: location.center[0],
      latitude: location.center[1],
      zoom: 15,
    });
    setShowResults(false);
  };

  const handleMapClick = async (evt: MapMouseEvent) => {
    const { lng, lat } = evt.lngLat;
    setViewState((prev) => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      zoom: 15,
    }));
    const result = await triggerReverseGeocode({ lng, lat }).unwrap();
    if (result.data.features && result.data.features.length > 0) {
      handleLocationSelect(result.data.features[0]);
    } else {
      toast.error("Could not determine an address for this location.");
    }
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
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      toast.error("An event must have at least one image.");
      return;
    }

    const formData = new FormData();

    // Append text fields that have values
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.address) formData.append("address", data.address);
    if (data.price !== undefined) formData.append("price", String(data.price));
    if (data.categoryId) formData.append("categoryId", data.categoryId);

    if (data.date && data.time) {
      const [hours, minutes] = data.time.split(":").map(Number);
      const combinedDate = new Date(data.date);
      combinedDate.setHours(hours, minutes);
      formData.append("date", combinedDate.toISOString());
    }

    // Append image data for the backend to process
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
          router.refresh(); // Refresh server components to get new data
          return "Event updated successfully!";
        },
        error: (err) => err.data?.message || "Failed to update event.",
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Event</CardTitle>
          <CardDescription>
            Update the details for your event below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Event Details
            </h3>
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
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Description</Label>
                <span
                  className={cn(
                    "text-xs",
                    (descriptionValue?.length || 0) > MAX_DESC_LENGTH
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {descriptionValue?.length || 0} / {MAX_DESC_LENGTH}
                </span>
              </div>
              <Textarea
                id="description"
                maxLength={MAX_DESC_LENGTH}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Date & Time</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
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
                          disabled={{ before: new Date() }}
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
                <Label>Time</Label>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time..." />
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-60">
                          {Array.from({ length: 24 * 4 }, (_, i) => {
                            const hour = Math.floor(i / 4)
                              .toString()
                              .padStart(2, "0");
                            const minute = ((i % 4) * 15)
                              .toString()
                              .padStart(2, "0");
                            return `${hour}:${minute}`;
                          }).map((timeValue) => (
                            <SelectItem key={timeValue} value={timeValue}>
                              {timeValue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                {errors.time && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.time.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
            <div className="space-y-2">
              <Label htmlFor="address">
                Search for an Address or Click on the Map
              </Label>
              <div className="relative">
                <Input
                  id="address"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  autoComplete="off"
                />
                {(isGeocoding || isReverseGeocoding) && (
                  <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin text-muted-foreground" />
                )}
                {geocodeData && searchQuery && showResults && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {geocodeData.data.features.map((location) => (
                      <div
                        key={location.id}
                        className="p-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <p className="font-semibold text-sm">
                          {location.properties.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {location.place_name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.address && (
                <p className="text-sm text-destructive mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div className="h-80 w-full rounded-lg overflow-hidden border cursor-pointer">
              <Map
                viewState={viewState}
                onMove={(evt: ViewStateChangeEvent) =>
                  setViewState(evt.viewState)
                }
                onClick={handleMapClick}
              >
                <Marker
                  longitude={viewState.longitude}
                  latitude={viewState.latitude}
                >
                  <MapPin className="h-6 w-6 text-red-500 drop-shadow-lg" />
                </Marker>
              </Map>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Images</h3>
            <div className="space-y-2">
              <Label>Manage Event Images (up to {MAX_IMAGES})</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {existingImages.map((url) => (
                  <div key={url} className="relative aspect-square">
                    <Image
                      src={url}
                      alt="Existing image"
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
                      alt="New image preview"
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isReverseGeocoding}
            size="lg"
          >
            {(isLoading || isReverseGeocoding) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
