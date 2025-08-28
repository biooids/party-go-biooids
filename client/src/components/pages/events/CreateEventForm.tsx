//src/components/pages/events/CreateEventForm.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  createEventSchema,
  CreateEventFormValues,
} from "@/lib/features/event/eventSchemas";
import { useCreateEventMutation } from "@/lib/features/event/eventApiSlice";
import { useGetAllCategoriesQuery } from "@/lib/features/eventCategory/eventCategoryApiSlice";
import {
  useLazyGeocodeAddressQuery,
  useLazyReverseGeocodeQuery,
} from "@/lib/features/map/mapApiSlice";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { MapPlaceFeature } from "@/lib/features/map/mapTypes";
import { cn } from "@/lib/utils";
import Map from "@/components/pages/map/Map";
import {
  Marker,
  type ViewStateChangeEvent,
  type MapMouseEvent,
} from "react-map-gl";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  X,
} from "lucide-react";

const MAX_IMAGES = 5;
const MAX_DESC_LENGTH = 500;
const DEFAULT_LOCATION: { longitude: number; latitude: number; zoom: number } =
  { longitude: 30.0588, latitude: -1.9441, zoom: 12 };

export default function CreateEventForm() {
  const router = useRouter();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [viewState, setViewState] = useState(DEFAULT_LOCATION);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [triggerGeocode, { data: geocodeData, isFetching: isGeocoding }] =
    useLazyGeocodeAddressQuery();
  const [triggerReverseGeocode, { isFetching: isReverseGeocoding }] =
    useLazyReverseGeocodeQuery();
  const [selectedLocation, setSelectedLocation] =
    useState<MapPlaceFeature | null>(null);
  const [showResults, setShowResults] = useState(false);

  // ✅ The form is now simply and correctly typed. All errors will be gone.
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      date: undefined,
      time: "",
      price: 0,
      categoryId: "",
    },
  });

  const descriptionValue = watch("description", "");

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length > 2) {
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
  ]);

  const handleLocationSelect = (location: MapPlaceFeature) => {
    setSelectedLocation(location);
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
    setViewState((prev) => ({ ...prev, longitude: lng, latitude: lat }));
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

  const onSubmit: SubmitHandler<CreateEventFormValues> = async (data) => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one event image.");
      return;
    }
    if (!selectedLocation) {
      toast.error(
        "Please select a valid location from the map or search results."
      );
      return;
    }

    const formData = new FormData();

    // ✅ All date and time logic is now handled here, which is much safer.
    const [hours, minutes] = data.time.split(":").map(Number);
    const combinedDate = new Date(data.date);
    combinedDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0

    // Manual check to ensure the date is in the future
    if (combinedDate <= new Date()) {
      toast.error("The selected event date and time must be in the future.");
      return;
    }

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("address", data.address);
    formData.append("date", combinedDate.toISOString()); // Send the final string to the backend
    formData.append("price", data.price.toString());
    formData.append("categoryId", data.categoryId);

    imageFiles.forEach((file) => formData.append("eventImages", file));

    toast.promise(createEvent(formData).unwrap(), {
      loading: "Submitting your event for approval...",
      success: (newEvent) => {
        router.push(`/my-events/${newEvent.data.event._id}`);
        return "Event submitted successfully!";
      },
      error: (err) => err.data?.message || "Failed to create event.",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Event</CardTitle>
          <CardDescription>
            Fill out the details below to get your event listed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Event Details
            </h3>
            <div>
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Rooftop Party"
                {...register("name")}
              />
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
                    descriptionValue.length > MAX_DESC_LENGTH
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {descriptionValue.length} / {MAX_DESC_LENGTH}
                </span>
              </div>
              <Textarea
                id="description"
                placeholder="Tell everyone about your event..."
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
                  placeholder="0.00 for free"
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
                <Input id="time" type="time" {...register("time")} />
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
                {selectedLocation && (
                  <Marker
                    longitude={selectedLocation.center[0]}
                    latitude={selectedLocation.center[1]}
                  >
                    <MapPin className="h-6 w-6 text-red-500 drop-shadow-lg" />
                  </Marker>
                )}
              </Map>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Images</h3>
            <div className="space-y-2">
              <Label htmlFor="images">Upload up to {MAX_IMAGES} Images</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={isLoading || isReverseGeocoding}
            size="lg"
          >
            {(isLoading || isReverseGeocoding) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Event
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
