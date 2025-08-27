"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Map from "@/components/pages/map/Map";
import { Marker } from "react-map-gl";

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

  const onSubmit: SubmitHandler<UpdateEventFormValues> = async (data) => {
    const payload: Partial<UpdateEventDto> = {};
    if (data.name) payload.name = data.name;
    if (data.description) payload.description = data.description;
    if (data.address) payload.address = data.address;
    if (data.price !== undefined) payload.price = data.price;
    if (data.categoryId) payload.categoryId = data.categoryId;

    if (data.date && data.time) {
      const [hours, minutes] = data.time.split(":").map(Number);
      const combinedDate = new Date(data.date);
      combinedDate.setHours(hours, minutes);
      payload.date = combinedDate.toISOString();
    }

    toast.promise(updateEvent({ eventId: event._id, body: payload }).unwrap(), {
      loading: "Saving changes...",
      success: "Event updated successfully!",
      error: (err) => err.data?.message || "Failed to update event.",
    });
    onFinished();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6"
    >
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

        {/* ✅ ADDED: Interactive map search for the address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address / Venue</Label>
          <div className="relative">
            <Input
              id="address"
              placeholder="Search for a new location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {isGeocoding && (
              <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin text-muted-foreground" />
            )}
            {geocodeData && searchQuery && (
              <div className="absolute z-20 top-full mt-1 w-full bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
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
          <p className="text-xs text-muted-foreground">
            Current: {event.address}
          </p>
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
      </div>

      {/* Right Side: Map and Images */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Location Preview</Label>
          <div className="h-64 w-full rounded-lg overflow-hidden border">
            <Map
              viewState={viewState}
              onMove={(evt) => setViewState(evt.viewState)}
            >
              {selectedLocation && (
                <Marker
                  longitude={selectedLocation.center[0]}
                  latitude={selectedLocation.center[1]}
                >
                  <MapPin className="h-6 w-6 text-red-500" />
                </Marker>
              )}
            </Map>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Current Images</Label>
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
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 pt-4">
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
