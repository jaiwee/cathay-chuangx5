"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { MapPin, Wifi, UtensilsCrossed, Dumbbell, Star } from "lucide-react";
import Image from "next/image";

type CarRental = {
  id: string;
  provider_name: string;
  service_type: string;
  country: string;
  price_per_day: number;
  booking_url: string;
  miles_eligible: boolean;
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
  const [destinationCountry, setDestinationCountry] = useState<string | null>(null);

  // Fetch destination country from form table
  useEffect(() => {
    async function fetchDestinationCountry() {
      try {
        const { data, error } = await supabase
          .from("form")
          .select("destination_country")
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

        console.log("Car rental query result (exact match):", { data, error, count: data?.length, country: destinationCountry });

        // If no results, try case-insensitive search by fetching all and filtering
        if (!error && (!data || data.length === 0)) {
          console.log("No exact match, trying to fetch all car rentals to check country values...");
          const { data: allData, error: allError } = await supabase
            .from("Car_rental")
            .select("*");
          
          console.log("All car rentals:", { allData, allError, count: allData?.length });
          
          if (allData) {
            // Filter case-insensitively
            const filtered = allData.filter(
              (car: CarRental) => car.country?.toLowerCase() === destinationCountry.toLowerCase()
            );
            console.log("Filtered car rentals (case-insensitive):", filtered.length);
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

        console.log("Hotel query result (exact match):", { data, error, count: data?.length, country: destinationCountry });

        // If no results, try case-insensitive search by fetching all and filtering
        if (!error && (!data || data.length === 0)) {
          console.log("No exact match, trying to fetch all hotels to check country values...");
          const { data: allData, error: allError } = await supabase
            .from("hotel")
            .select("*");
          
          console.log("All hotels:", { allData, allError, count: allData?.length });
          
          if (allData) {
            // Filter case-insensitively
            const filtered = allData.filter(
              (hotel: Hotel) => hotel.country?.toLowerCase() === destinationCountry.toLowerCase()
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
  const parseAmenities = (amenitiesStr: string | string[] | null | undefined): { icon: React.ReactNode; label: string }[] => {
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
    if (typeof amenitiesStr === 'string') {
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
      <div className="h-full mx-auto max-w-6xl p-6 md:p-10">
        <div className="h-full grid grid-cols-1 gap-6 md:grid-cols-2">
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
                <div className="p-4 text-sm text-gray-600">Loading vehicles...</div>
              ) : carRentals.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">No vehicles available</div>
              ) : (
                carRentals.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm"
                  >
                    <div className="relative h-48 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                      <div className="text-gray-400 dark:text-gray-600 text-sm">Vehicle Image</div>
                      {/* Powered by Hertz */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
                        <div className="bg-white/50 dark:bg-zinc-900/50 px-2 py-1 mb-1 rounded flex items-center gap-1.5">
                          <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Powered by</span>
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
                            {car.provider_name}
                          </h3>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs rounded break-words">
                            {car.service_type}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-semibold text-gray-800 dark:text-white break-words">
                            ${car.price_per_day}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">per day</p>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-[#014A43] text-white hover:bg-[#013832]"
                        onClick={() => car.booking_url && window.open(car.booking_url, '_blank')}
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
                <div className="p-4 text-sm text-gray-600">Loading hotels...</div>
              ) : hotels.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">No hotels available</div>
              ) : (
                hotels.map((hotel) => {
                  const amenities = parseAmenities(hotel.amenities);
                  return (
                    <div
                      key={hotel.id}
                      className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm"
                    >
                      <div className="relative h-48 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                        <div className="text-gray-400 dark:text-gray-600 text-sm">Hotel Image</div>
                        {/* Powered by Expedia */}
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
                          <div className="bg-white/50 dark:bg-zinc-900/50 px-2 py-1 mb-1 rounded flex items-center gap-1.5">
                            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Powered by</span>
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
                            <span className="break-words">{hotel.address}</span>
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
                                  <div className="flex-shrink-0">{amenity.icon}</div>
                                  <span className="break-words">{amenity.label}</span>
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
                            onClick={() => hotel.booking_url && window.open(hotel.booking_url, '_blank')}
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
