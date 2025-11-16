"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { MapPin, Wifi, UtensilsCrossed, Dumbbell, Star } from "lucide-react";
import Image from "next/image";
import { HotelRecommendation } from "@/types/pipeline";

type CarRental = {
  id: string;
  provider_name: string;
  service_type: string;
  country: string;
  price_per_day: number;
  booking_url: string;
  miles_eligible: boolean;
  image_url?: string | null;
  model_name: string;
};

type Hotel = {
  id: string;
  name: string;
  address: string;
  country: string;
  rating: number;
  booking_url: string;
  price_per_night: number;
  amenities: string | string[] | null;
  image_url?: string | null;
};

type RecommendedCarCombination = {
  model: string;
  type: string;
  quantity: number;
  capacity: number;
  total_capacity: number;
  price_per_day: string;
};

type CarRentalRecommendation = {
  recommended_combination: RecommendedCarCombination[];
  total_cars: number;
  total_capacity: number;
  reasoning: string;
};

// Amenity icon mapping
const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  "free wifi": <Wifi className="h-4 w-4" />,
  breakfast: <UtensilsCrossed className="h-4 w-4" />,
  restaurant: <UtensilsCrossed className="h-4 w-4" />,
  fitness: <Dumbbell className="h-4 w-4" />,
  "fitness center": <Dumbbell className="h-4 w-4" />,
};

export default function SmartRecommendationPage() {
  const [carRentals, setCarRentals] = useState<CarRental[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [isLoadingHotels, setIsLoadingHotels] = useState(true);
  const [destinationCountry, setDestinationCountry] = useState<string | null>(
    null
  );
  const [carRecommendation, setCarRecommendation] =
    useState<CarRentalRecommendation | null>(null);
  const [hotelRecommendation, setHotelRecommendation] = useState<
    HotelRecommendation[] | null
  >(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"transport" | "hotel">(
    "transport"
  );

  console.log("[SmartRec] Current carRecommendation state:", carRecommendation);
  console.log(
    "[SmartRec] Current hotelRecommendation state:",
    hotelRecommendation
  );

  // Load AI recommendations from localStorage
  useEffect(() => {
    console.log("[SmartRec] Component mounted, checking localStorage...");
    const stored = localStorage.getItem("pipelineRecommendations");
    console.log("[SmartRec] Raw localStorage data:", stored);

    if (stored) {
      try {
        const recommendations = JSON.parse(stored);
        console.log("[SmartRec] Parsed recommendations:", recommendations);
        console.log(
          "[SmartRec] Car rental recommendation:",
          recommendations.car_rental
        );

        if (recommendations.car_rental) {
          console.log("[SmartRec] Setting car recommendation state...");
          setCarRecommendation(recommendations.car_rental);
          console.log("[SmartRec] Car recommendation state set successfully");
        } else {
          console.warn(
            "[SmartRec] No car_rental found in stored recommendations"
          );
        }

        if (recommendations.hotels) {
          console.log("[SmartRec] Setting hotel recommendation state...");
          setHotelRecommendation(recommendations.hotels);
          console.log("[SmartRec] Hotel recommendation state set successfully");
        } else {
          console.warn("[SmartRec] No hotels found in stored recommendations");
        }
      } catch (error) {
        console.error(
          "[SmartRec] Error parsing stored recommendations:",
          error
        );
      }
    } else {
      console.warn(
        "[SmartRec] No recommendations found in localStorage. Make sure pipeline has run."
      );
    }
  }, []);

  // Fetch destination country from form table
  useEffect(() => {
    async function fetchDestinationCountry() {
      try {
        const { data, error } = await supabase
          .from("form")
          .select("destination_country")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        console.log("Form data:", { data, error });

        if (error) {
          console.error("Error fetching destination country:", error);
          return;
        }

        if (data?.destination_country) {
          console.log("Destination country:", data.destination_country);
          setDestinationCountry(data.destination_country);
        } else {
          console.log("No destination_country found in form data");
        }
      } catch (error) {
        console.error("Error fetching destination country:", error);
      }
    }

    fetchDestinationCountry();
  }, []);

  // Fetch car rentals based on destination country
  useEffect(() => {
    async function fetchCarRentals() {
      if (!destinationCountry) {
        console.log("No destination country, skipping car rental fetch");
        return;
      }

      console.log("Fetching car rentals for country:", destinationCountry);

      try {
        // Try exact match first
        let { data, error } = await supabase
          .from("car_rental")
          .select("*")
          .eq("country", destinationCountry);

        console.log("Car rental query result (exact match):", {
          data,
          error,
          count: data?.length,
          country: destinationCountry,
        });

        // If no results, try case-insensitive search by fetching all and filtering
        if (!error && (!data || data.length === 0)) {
          console.log(
            "No exact match, trying to fetch all car rentals to check country values..."
          );
          const { data: allData, error: allError } = await supabase
            .from("Car_rental")
            .select("*");

          console.log("All car rentals:", {
            allData,
            allError,
            count: allData?.length,
          });

          if (allData) {
            // Filter case-insensitively
            const filtered = allData.filter(
              (car: CarRental) =>
                car.country?.toLowerCase() === destinationCountry.toLowerCase()
            );
            console.log(
              "Filtered car rentals (case-insensitive):",
              filtered.length
            );
            data = filtered;
            error = null;
          }
        }

        if (error) {
          console.error("Error fetching car rentals:", error);
          setIsLoadingCars(false);
          return;
        }

        if (data) {
          console.log("Car rentals found:", data.length);
          setCarRentals(data as CarRental[]);
        } else {
          console.log("No car rentals data returned");
        }
      } catch (error) {
        console.error("Error fetching car rentals:", error);
      } finally {
        setIsLoadingCars(false);
      }
    }

    fetchCarRentals();
  }, [destinationCountry]);

  // Fetch hotels based on destination country
  useEffect(() => {
    async function fetchHotels() {
      if (!destinationCountry) {
        console.log("No destination country, skipping hotel fetch");
        return;
      }

      console.log("Fetching hotels for country:", destinationCountry);

      try {
        // Try exact match first
        let { data, error } = await supabase
          .from("hotel")
          .select("*")
          .eq("country", destinationCountry);

        console.log("Hotel query result (exact match):", {
          data,
          error,
          count: data?.length,
          country: destinationCountry,
        });

        // If no results, try case-insensitive search by fetching all and filtering
        if (!error && (!data || data.length === 0)) {
          console.log(
            "No exact match, trying to fetch all hotels to check country values..."
          );
          const { data: allData, error: allError } = await supabase
            .from("hotel")
            .select("*");

          console.log("All hotels:", {
            allData,
            allError,
            count: allData?.length,
          });

          if (allData) {
            // Filter case-insensitively
            const filtered = allData.filter(
              (hotel: Hotel) =>
                hotel.country?.toLowerCase() ===
                destinationCountry.toLowerCase()
            );
            console.log("Filtered hotels (case-insensitive):", filtered.length);
            data = filtered;
            error = null;
          }
        }

        if (error) {
          console.error("Error fetching hotels:", error);
          setIsLoadingHotels(false);
          return;
        }

        if (data) {
          console.log("Hotels found:", data.length);
          setHotels(data as Hotel[]);
        } else {
          console.log("No hotels data returned");
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setIsLoadingHotels(false);
      }
    }

    fetchHotels();
  }, [destinationCountry]);

  // Parse amenities string into array
  const parseAmenities = (
    amenitiesStr: string | string[] | null | undefined
  ): { icon: React.ReactNode; label: string }[] => {
    if (!amenitiesStr) return [];

    // Handle array type (PostgreSQL array)
    if (Array.isArray(amenitiesStr)) {
      return amenitiesStr.map((amenity) => {
        const trimmed = String(amenity).trim().toLowerCase();
        const icon = amenityIcons[trimmed] || <Wifi className="h-4 w-4" />;
        return {
          icon,
          label: String(amenity).trim(),
        };
      });
    }

    // Handle string type (comma-separated)
    if (typeof amenitiesStr === "string") {
      return amenitiesStr.split(",").map((amenity) => {
        const trimmed = amenity.trim().toLowerCase();
        const icon = amenityIcons[trimmed] || <Wifi className="h-4 w-4" />;
        return {
          icon,
          label: amenity.trim(),
        };
      });
    }

    return [];
  };

  return (
    <div className="h-screen bg-zinc-50 dark:bg-black overflow-hidden">
      <div className="h-full flex flex-col items-center p-6 md:p-10">
        {/* Catherine Recommends Button */}
        {(carRecommendation || hotelRecommendation) && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowRecommendationModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-[#014A43] to-[#016B5F] text-white font-semibold rounded-lg hover:from-[#013831] hover:to-[#015449] transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
              See what Catherine Recommends
            </button>
          </div>
        )}

        <div className="w-full max-w-5xl flex-1 grid grid-cols-1 gap-6 md:grid-cols-2 overflow-hidden">
          {/* AI Recommended Combination Modal */}
          {(carRecommendation || hotelRecommendation) &&
            showRecommendationModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setShowRecommendationModal(false)}
              >
                <div
                  className="relative max-w-2xl w-full mx-4 h-[90vh] flex flex-col rounded-lg border-2 border-[#014A43] bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setShowRecommendationModal(false)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-600 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Modal Header */}
                  <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-[#014A43] animate-pulse"></div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Catherine&apos;s Recommendation
                      </h2>
                    </div>

                    {/* Tab Navigator */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-700">
                      <button
                        onClick={() => setActiveTab("transport")}
                        className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                          activeTab === "transport"
                            ? "text-[#014A43] dark:text-[#016B5F]"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                      >
                        Transport
                        {activeTab === "transport" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#014A43] dark:bg-[#016B5F]"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("hotel")}
                        className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                          activeTab === "hotel"
                            ? "text-[#014A43] dark:text-[#016B5F]"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                      >
                        Hotel
                        {activeTab === "hotel" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#014A43] dark:bg-[#016B5F]"></div>
                        )}
                      </button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      {/* Transport Tab Content */}
                      {activeTab === "transport" && carRecommendation && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Our AI has curated the perfect vehicle combination
                            for your group.
                          </p>
                          {/* Combination Cards */}
                          {carRecommendation.recommended_combination.map(
                            (car, index) => (
                              <div
                                key={index}
                                className="bg-gradient-to-br from-[#F4FAF9] to-white dark:from-zinc-800 dark:to-zinc-900 rounded-lg border border-[#014A43] p-4"
                              >
                                <div className="mb-3">
                                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {car.model}
                                  </h3>
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-[#014A43] text-white text-xs rounded">
                                    {car.type}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="bg-white dark:bg-zinc-800 rounded p-2 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Quantity
                                    </p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                      {car.quantity}
                                    </p>
                                  </div>
                                  <div className="bg-white dark:bg-zinc-800 rounded p-2 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Capacity
                                    </p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                      {car.capacity}
                                    </p>
                                  </div>
                                  <div className="bg-white dark:bg-zinc-800 rounded p-2 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Total
                                    </p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                      {car.total_capacity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}

                          {/* Summary */}
                          <div className="bg-[#014A43] text-white rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Total Vehicles:
                              </span>
                              <span className="text-lg font-bold">
                                {carRecommendation.total_cars}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                Total Capacity:
                              </span>
                              <span className="text-lg font-bold">
                                {carRecommendation.total_capacity} passengers
                              </span>
                            </div>
                          </div>

                          {/* Reasoning */}
                          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                              Why this combination?
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {carRecommendation.reasoning}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Hotel Tab Content */}
                      {activeTab === "hotel" && hotelRecommendation && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Our AI has selected the best hotels for your stay.
                          </p>

                          {/* Hotel Cards */}
                          {hotelRecommendation.map((hotel, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-[#F4FAF9] to-white dark:from-zinc-800 dark:to-zinc-900 rounded-lg border border-[#014A43] p-4"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                                    {hotel.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center gap-1 text-xs bg-[#014A43] text-white px-2 py-0.5 rounded">
                                      <Star className="h-3 w-3 fill-current" />
                                      {hotel.rating}
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    <span>{hotel.address}</span>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-lg font-semibold text-[#014A43]">
                                    ${hotel.price_per_night}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    per night
                                  </p>
                                </div>
                              </div>

                              {/* Amenities */}
                              {hotel.amenities &&
                                hotel.amenities.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                      Amenities
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {hotel.amenities.map((amenity, idx) => {
                                        const icon = amenityIcons[
                                          amenity.toLowerCase()
                                        ] || <Wifi className="h-3 w-3" />;
                                        return (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded"
                                          >
                                            {icon}
                                            <span>{amenity}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

          {/* Vehicle Recommendations Section */}
          <div className="h-full flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex-shrink-0 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Vehicle Recommendations
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose from our curated selection of rental vehicles.
              </p>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4 pr-6">
                {isLoadingCars ? (
                  <div className="p-4 text-sm text-gray-600">
                    Loading vehicles...
                  </div>
                ) : carRentals.length === 0 ? (
                  <div className="p-4 text-sm text-gray-600">
                    No vehicles available
                  </div>
                ) : (
                  carRentals.map((car) => (
                    <div
                      key={car.id}
                      className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm"
                    >
                      <div className="relative h-48 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                        {car.image_url ? (
                          <Image
                            src={car.image_url || ""}
                            alt={car.model_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="text-gray-400 dark:text-gray-600 text-sm">
                            Vehicle Image
                          </div>
                        )}
                        {/* Powered by Hertz */}
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
                          <div className="bg-white/50 dark:bg-zinc-900/50 px-2 py-1 mb-1 rounded flex items-center gap-1.5">
                            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                              Powered by
                            </span>
                            <div className="relative h-5 w-20">
                              <Image
                                src="/hertz-logo.svg"
                                alt="Hertz"
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                          </div>
                          {car.miles_eligible && (
                            <div className="bg-[#014A43] text-white px-3 py-1 rounded-full text-xs font-medium">
                              Miles Eligible
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white break-words">
                              {car.model_name}
                            </h3>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs rounded break-words">
                              {car.service_type}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-semibold text-gray-800 dark:text-white break-words">
                              ${car.price_per_day}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                              per day
                            </p>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-[#014A43] text-white hover:bg-[#013832]"
                          onClick={() =>
                            car.booking_url &&
                            window.open(car.booking_url, "_blank")
                          }
                        >
                          Reserve Vehicle
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Hotel Recommendations Section */}
          <div className="h-full flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex-shrink-0 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Hotel Recommendations
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stay at these carefully selected accommodations near your venue.
              </p>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4 pr-6">
                {isLoadingHotels ? (
                  <div className="p-4 text-sm text-gray-600">
                    Loading hotels...
                  </div>
                ) : hotels.length === 0 ? (
                  <div className="p-4 text-sm text-gray-600">
                    No hotels available
                  </div>
                ) : (
                  hotels.map((hotel) => {
                    const amenities = parseAmenities(hotel.amenities);
                    return (
                      <div
                        key={hotel.id}
                        className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm"
                      >
                        <div className="relative h-48 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                          {hotel.image_url ? (
                            <Image
                              src={hotel.image_url || ""}
                              alt={hotel.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="text-gray-400 dark:text-gray-600 text-sm">
                              Hotel Image
                            </div>
                          )}
                          {/* Powered by Expedia */}
                          <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
                            <div className="bg-white/50 dark:bg-zinc-900/50 px-2 py-1 mb-1 rounded flex items-center gap-1.5">
                              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                                Powered by
                              </span>
                              <div className="relative h-5 w-24">
                                <Image
                                  src="/expedia-logo.svg"
                                  alt="Expedia"
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            </div>
                            <div className="bg-[#014A43] text-white px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium">
                              <Star className="h-3 w-3 fill-current" />
                              {hotel.rating}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 break-words">
                              {hotel.name}
                            </h3>
                            <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span className="break-words">
                                {hotel.address}
                              </span>
                            </div>
                          </div>

                          {amenities.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                AMENITIES
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {amenities.map((amenity, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 min-w-0"
                                  >
                                    <div className="flex-shrink-0">
                                      {amenity.icon}
                                    </div>
                                    <span className="break-words">
                                      {amenity.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-gray-200 dark:border-zinc-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 break-words">
                              From ${hotel.price_per_night} per night
                            </p>
                            <Button
                              className="w-full bg-[#014A43] text-white hover:bg-[#013832]"
                              onClick={() =>
                                hotel.booking_url &&
                                window.open(hotel.booking_url, "_blank")
                              }
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
