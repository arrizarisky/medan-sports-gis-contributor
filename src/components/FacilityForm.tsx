import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Facility, SPORT_TYPES } from "../types";
import { Button, Input, Card, Badge } from "../components/UI";
import { Modal } from "../components/Modal";
import {
  Camera,
  MapPin,
  Navigation,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Loader2,
  Trash2,
  Search,
  Star,
  StarHalf,
  Image
} from "lucide-react";
import { cn } from "../lib/utils";
import { facilityService } from "../services/facilityService";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../lib/utils";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icon in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const facilitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum([
    "gym",
    "futsal",
    "badminton",
    "padel",
    "jogging",
    "mini soccer",
  ]),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  price: z.string().min(1, "Price is required"),
  opening_hours: z.string().min(1, "Opening hours are required"),
  facilities: z.array(z.string()).min(1, "Add at least one facility"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  rating: z.number().min(0).max(5),
  ratingSource: z.string().min(1, "Rating source is required"),
  contributor_name: z.string().min(1, "Contributor name is required"),
  contributor_email: z.string().email("Invalid email"),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-zinc-100 shadow-inner">
      <MapContainer
        center={[lat || 3.5952, lng || 98.6722]} // Default to Medan
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onChange(position.lat, position.lng);
            },
          }}
        />
        <MapEvents />
      </MapContainer>
      <div className="absolute bottom-4 left-1/2 z-997 -translate-x-1/2 rounded-full bg-zinc-900/80 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
        Tap map to set location
      </div>
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 bottom-4 flex-wrap">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = star <= value;
        const isHalf = !isFull && star - 0.5 <= value;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="relative transition-transform active:scale-90"
          >
            <Star className="h-8 w-8 text-zinc-200" />
            {isFull ? (
              <Star className="absolute inset-0 h-8 w-8 fill-amber-400 text-amber-400" />
            ) : isHalf ? (
              <StarHalf className="absolute inset-0 h-8 w-8 fill-amber-400 text-amber-400" />
            ) : null}
          </button>
        );
      })}
      <span className="ml-2 text-lg font-black text-zinc-900">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

interface FacilityFormProps {
  initialData?: Facility;
  isEditing?: boolean;
}

export default function FacilityForm({
  initialData,
  isEditing,
}: FacilityFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAgreement, setShowAgreement] = useState(!isEditing);
  const [agreed, setAgreed] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isPhotoSourceOpen, setIsPhotoSourceOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      console.log('FacilityForm initialized with data:', initialData);
    }
  }, [initialData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          lat: initialData.lat,
          lng: initialData.lng,
          price: initialData.price,
          opening_hours: initialData.opening_hours,
          facilities: initialData.facilities,
          description: initialData.description,
          rating: initialData.rating || 0,
          ratingSource: initialData.ratingSource || "Google Maps",
          contributor_name:
            initialData.contributor_name ||
            user?.user_metadata?.full_name ||
            "",
          contributor_email: initialData.contributor_email || user?.email || "",
        }
      : {
          type: "gym",
          lat: 3.5952,
          lng: 98.6722,
          price: "",
          opening_hours: "",
          facilities: [],
          rating: 0,
          ratingSource: "Google Maps",
          contributor_name: user?.user_metadata?.full_name || "",
          contributor_email: user?.email || "",
        },
  });

  const lat = watch("lat");
  const lng = watch("lng");
  const rating = watch("rating");
  const selectedFacilities = watch("facilities") || [];

  const toggleFacility = (facility: string) => {
    const current = [...selectedFacilities];
    const index = current.indexOf(facility);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(facility);
    }
    setValue("facilities", current, { shouldValidate: true });
  };

  const commonFacilities = [
    "Parking",
    "Toilet",
    "Shower",
    "Canteen",
    "Locker",
    "Wifi",
    "AC",
    "Prayer Room",
    "Equipment Rental",
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          return null;
        }
        return facilityService.uploadPhoto(file, user.id);
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => url !== null);
      setPhotos((prev) => [...prev, ...validUrls]);
      toast.success("Photos uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload photos: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const detectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("lat", position.coords.latitude);
        setValue("lng", position.coords.longitude);
        toast.success("Location detected!");
        setDetectingLocation(false);
      },
      (error) => {
        toast.error("Failed to detect location: " + error.message);
        setDetectingLocation(false);
      },
    );
  };

  const onSubmit = async (data: FacilityFormData) => {
    if (photos.length === 0) {
      toast.error("Please upload at least one photo");
      return;
    }

    setSubmitting(true);
    try {
      const facilityData = {
        ...data,
        priceValue: formatPrice(data.price),

        photos,
        user_id: user?.id,
      };

      console.log('Submitting facility data:', facilityData);

      if (isEditing && initialData) {
        await facilityService.update(initialData.id, facilityData);
        toast.success("Facility updated successfully!");
      } else {
        await facilityService.create(facilityData);
        toast.success("Facility submitted successfully!");
      }
      navigate("/my-contributions");
    } catch (error: any) {
      toast.error("Failed to submit: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (showAgreement) {
    return (
      <Modal
        isOpen={showAgreement}
        onClose={() => navigate("/")}
        title="Contributor Agreement"
        footer={
          <>
            <Button variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button disabled={!agreed} onClick={() => setShowAgreement(false)}>
              Continue
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3 rounded-2xl bg-blue-50 p-4 text-blue-700">
            <Info className="h-6 w-6 shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Important Rules:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Data must be honest and accurate.</li>
                <li>No fake places or spam.</li>
                <li>Accurate location (GPS) is required.</li>
                <li>You are responsible for the data you submit.</li>
              </ul>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">
              I agree and will submit valid information.
            </span>
          </label>
        </div>
      </Modal>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {isEditing ? "Edit Place" : "Add New Place"}
        </h1>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Medan Sports Facility Data
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Place Name
              </label>
              <Input
                placeholder="e.g. Medan Futsal Center"
                {...register("name")}
                className="rounded-2xl"
              />
              {errors.name && (
                <p className="text-[10px] font-bold text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Sport Type
              </label>
              <select
                className="flex h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
                {...register("type")}
              >
                {SPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Location Point
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={detectLocation}
                isLoading={detectingLocation}
                className="h-8 rounded-full"
              >
                <Navigation className="mr-2 h-3 w-3" />
                Auto GPS
              </Button>
            </div>

            <MapPicker
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => {
                setValue("lat", newLat);
                setValue("lng", newLng);
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register("lat", { valueAsNumber: true })}
                  className="h-10 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register("lng", { valueAsNumber: true })}
                  className="h-10 text-xs"
                />
              </div>
            </div>
            {(errors.lat || errors.lng) && (
              <p className="text-[10px] font-bold text-red-500">
                Valid coordinates required
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price / Rate</label>
                <button
                  type="button"
                  onClick={() => setValue('price', 'Free', { shouldValidate: true })}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Set Free
                </button>
              </div>
              <Input
                placeholder="e.g. Rp 50.000 / hour"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-[10px] font-bold text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Opening Hours</label>
                <button
                  type="button"
                  onClick={() => setValue('opening_hours', '24 Hours', { shouldValidate: true })}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Set 24 Hours
                </button>
              </div>
              <Input
                placeholder="e.g. 08:00 - 22:00"
                {...register("opening_hours")}
              />
              {errors.opening_hours && (
                <p className="text-[10px] font-bold text-red-500">
                  {errors.opening_hours.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Available Facilities
            </label>
            <div className="flex flex-wrap gap-2">
              {commonFacilities.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFacility(f)}
                  className={cn(
                    "rounded-2xl px-4 py-2 text-[10px] font-bold uppercase tracking-tight transition-all",
                    selectedFacilities.includes(f)
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            {errors.facilities && (
              <p className="text-[10px] font-bold text-red-500">
                {errors.facilities.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Description
            </label>
            <textarea
              className="min-h-[120px] w-full rounded-3xl border border-zinc-100 bg-zinc-50 px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Describe the place, rules, or any other info..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[10px] font-bold text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Rating (0-5)
              </label>
              <StarRating
                value={rating}
                onChange={(val) =>
                  setValue("rating", val, { shouldValidate: true })
                }
              />
              <div className="flex gap-2 flex-wrap">
                {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      setValue("rating", v, { shouldValidate: true })
                    }
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-lg transition-all",
                      rating === v
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-500",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-[10px] font-bold text-red-500">
                  {errors.rating.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Rating Source
              </label>
              <Input
                placeholder="e.g. Google Maps"
                {...register("ratingSource")}
              />
              {errors.ratingSource && (
                <p className="text-[10px] font-bold text-red-500">
                  {errors.ratingSource.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Photos
            </label>
            <div className="grid grid-cols-3 gap-4">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video overflow-hidden rounded-3xl bg-zinc-100 border border-zinc-100"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute right-2 top-2 rounded-2xl bg-black/50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
               <button
                type="button"
                onClick={() => setIsPhotoSourceOpen(true)}
                className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
              >
                <Plus className="mb-1 text-zinc-400" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Add Photo</span>
              </button>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
            />
            <input
              type="file"
              ref={galleryInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
            />

            {/* Photo Source Modal */}
            {isPhotoSourceOpen && (
              <div className="fixed inset-0 z-1000 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
                <div className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900">Select Source</h4>
                      <button 
                        onClick={() => setIsPhotoSourceOpen(false)}
                        className="text-zinc-400 hover:text-zinc-900"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          cameraInputRef.current?.click();
                          setIsPhotoSourceOpen(false);
                        }}
                        className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-zinc-100"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
                          <Camera size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          galleryInputRef.current?.click();
                          setIsPhotoSourceOpen(false);
                        }}
                        className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-zinc-100"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
                          <Image size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Gallery</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
        </Card>

        <div className="flex gap-4 pb-12">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={submitting}>
            {isEditing ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
