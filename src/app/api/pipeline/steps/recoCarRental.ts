import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  HolisticData,
  FlightRecommendation,
  CarRentalRecommendation,
  CarModel,
  CarRentalDB,
} from "@/types/pipeline";

// Create server-side Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key must be set in environment variables"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Fetch available car rentals from Supabase
async function getAvailableCarRentals(
  destinationCountry: string,
  destinationCity?: string
): Promise<CarModel[]> {
  const supabase = getSupabaseClient();

  // Build query - filter by destination country
  let query = supabase
    .from("car_rental")
    .select("*")
    .eq("country", destinationCountry);

  // Optionally filter by city if provided
  if (destinationCity) {
    query = query.eq("city", destinationCity);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching car rentals from Supabase:", error);
    throw new Error(`Failed to fetch car rentals: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn(
      `No car rentals found for country: ${destinationCountry}${
        destinationCity ? `, city: ${destinationCity}` : ""
      }`
    );
    return [];
  }

  // Map database records to CarModel format
  return data.map((car: CarRentalDB) => ({
    provider_name: car.provider_name,
    service_type: car.service_type,
    city: car.city,
    country: car.country,
    price_per_day: car.price_per_day,
    booking_url: car.booking_url,
    miles_eligible: car.miles_eligible,
  }));
}

export async function getCarRentalRecommendation(
  holisticData: HolisticData,
  flight: FlightRecommendation
): Promise<CarRentalRecommendation> {
  // Fetch available car rentals from Supabase
  const availableCars = await getAvailableCarRentals(
    flight.destination_country
  );

  if (availableCars.length === 0) {
    throw new Error(
      `No car rentals available in ${flight.destination_country}. Please ensure car rental data exists in the database.`
    );
  }

  // Map cars to a readable format for the LLM prompt
  // Note: We'll need to estimate capacity based on service_type since it's not in the DB
  const getEstimatedCapacity = (serviceType: string): number => {
    const type = serviceType.toLowerCase();
    if (type.includes("van") || type.includes("minivan")) return 8;
    if (type.includes("suv")) return 7;
    return 5; // default for sedan
  };

  const availableCarsString = availableCars
    .map(
      (car) =>
        `- Provider: ${car.provider_name}, Type: ${
          car.service_type
        }, Location: ${car.city}, ${car.country}, Price: $${(
          car.price_per_day / 100
        ).toFixed(2)}/day, Miles Eligible: ${
          car.miles_eligible
        }, Estimated Capacity: ${getEstimatedCapacity(
          car.service_type
        )} passengers, Booking: ${car.booking_url}`
    )
    .join("\n");

  const prompt = `
You are a car rental recommendation assistant helping travelers choose the best combination of vehicles for their trip.

Event Details:
- Theme: ${holisticData.theme}
- Event Name: ${holisticData.event_name}
- Event Date: ${holisticData.event_date}
- Event Location: ${holisticData.event_location.address}, ${holisticData.event_location.country}
- Group Size: ${holisticData.group_size} people

Flight Details (for context):
- Origin: ${flight.origin_airport}, ${flight.origin_country}
- Destination: ${flight.destination_airport}, ${flight.destination_country}
- Arrival: ${flight.arrival_time}
- Duration: ${flight.duration} minutes

Available Car Rentals (from database):
${availableCarsString}

Based on this information, recommend the BEST COMBINATION of rental cars for the group. Consider:
1. The group size is ${holisticData.group_size} people - ensure sufficient capacity
2. Cost efficiency - minimize number of cars while maintaining comfort
3. Event appropriateness - ${holisticData.theme} event may have specific needs
4. Location proximity - prefer cars in ${flight.destination_country} near the event location
5. Mix of vehicle types if beneficial (e.g., SUV for luggage + sedans for smaller groups)
6. Miles eligibility if relevant for the travelers

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "recommended_combination": [
    {
      "model": "Provider Name (use provider_name from available cars)",
      "type": "service_type from available cars (sedan/suv/van)",
      "quantity": 2,
      "capacity": 5,
      "total_capacity": 10,
      "price_per_day": "$XX"
    }
  ],
  "total_cars": 2,
  "total_capacity": 10,
  "reasoning": "Explanation of why this combination is best for the group"
}
`;

  // Generate text using Vercel AI SDK with Google Gemini
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt,
  });

  // Parse the JSON response
  let parsedResponse;
  try {
    // Remove any markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    parsedResponse = JSON.parse(cleanedText);
  } catch {
    console.error("Failed to parse car rental LLM response:", text);
    throw new Error("LLM returned invalid JSON format for car rental");
  }

  // Return the parsed car rental recommendation
  return parsedResponse as CarRentalRecommendation;
}
