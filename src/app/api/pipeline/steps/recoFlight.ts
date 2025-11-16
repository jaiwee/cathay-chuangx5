import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  HolisticData,
  FlightRecommendation,
  FlightRecommendationSchema,
  FlightDB,
} from "@/types/pipeline";
import {
  getFlightIdByFlightCode,
  updateFormWithFlightId,
} from "@/lib/db-helpers";

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

// Fetch available flights from Supabase
async function getAvailableFlights(
  originCountry: string,
  destinationCountry: string,
  timingPreference: "morning" | "afternoon" | "evening"
): Promise<FlightDB[]> {
  const supabase = getSupabaseClient();

  // Build base query - filter by origin and destination countries
  const { data, error } = await supabase
    .from("flight")
    .select("*")
    .eq("origin_country", originCountry)
    .eq("destination_country", destinationCountry);

  if (error) {
    console.error("Error fetching flights from Supabase:", error);
    throw new Error(`Failed to fetch flights: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn(
      `No flights found for origin: ${originCountry}, destination: ${destinationCountry}`
    );
    return [];
  }

  // Filter by timing preference based on departure_time hour
  // departure_time is stored as ISO 8601 timestamp string (e.g., "2024-01-15T10:30:00Z")
  const filteredFlights = data.filter((flight: FlightDB) => {
    const departureTime = new Date(flight.departure_time);
    const hour = departureTime.getUTCHours(); // Use UTC hours to avoid timezone issues

    if (timingPreference === "morning") {
      // Morning: before 12pm (hour < 12)
      return hour < 12;
    } else if (timingPreference === "afternoon") {
      // Afternoon: 12pm-4pm (hour >= 12 and hour < 17)
      return hour >= 12 && hour < 17;
    } else if (timingPreference === "evening") {
      // Evening: 5pm onwards (hour >= 17)
      return hour >= 17;
    }
    return true;
  });

  if (filteredFlights.length === 0) {
    console.warn(
      `No flights found for origin: ${originCountry}, destination: ${destinationCountry}, timing: ${timingPreference}`
    );
    return [];
  }

  return filteredFlights as FlightDB[];
}

export async function getFlightRecommendation(
  holisticData: HolisticData
): Promise<FlightRecommendation> {
  // Fetch available flights from Supabase
  const availableFlights = await getAvailableFlights(
    holisticData.origin_country,
    holisticData.destination_country,
    holisticData.flight_timing_preference
  );

  if (availableFlights.length === 0) {
    throw new Error(
      `No flights available from ${holisticData.origin_country} to ${holisticData.destination_country} with ${holisticData.flight_timing_preference} timing preference. Please ensure flight data exists in the database.`
    );
  }

  console.log(
    `[recoFlight] Found ${availableFlights.length} available flights:`,
    availableFlights.map((f) => ({
      id: f.id,
      flight_code: f.flight_code,
      origin_airport: f.origin_airport,
      destination_airport: f.destination_airport,
    }))
  );

  // Format flights for the LLM prompt
  const flightsListString = availableFlights
    .map(
      (flight, index) =>
        `${index + 1}. Origin: ${flight.origin_airport} (${
          flight.origin_country
        }), Destination: ${flight.destination_airport} (${
          flight.destination_country
        }), Departure: ${flight.departure_time}, Arrival: ${
          flight.arrival_time
        }, Duration: ${flight.duration} minutes${
          flight.flight_code ? `, Flight Code: ${flight.flight_code}` : ""
        }`
    )
    .join("\n");

  const prompt = `
You are a travel planning assistant specializing in flight recommendations for events.

Event Details:
- Theme: ${holisticData.theme}
- Event Name: ${holisticData.event_name}
- Event Date: ${holisticData.event_date}
- Event Time: ${holisticData.event_time}
- Event Location: ${holisticData.event_location.address}, ${holisticData.event_location.country}
- Origin Country: ${holisticData.origin_country}
- Destination Country: ${holisticData.destination_country}
- Flight Timing Preference: ${holisticData.flight_timing_preference}
- Group Size: ${holisticData.group_size}

Available Flights from ${holisticData.origin_country} to ${holisticData.destination_country} (${holisticData.flight_timing_preference} timing - SELECT ONE from this list):
${flightsListString}

Based on the above information, select the BEST flight from the available list above that:
1. Matches the flight timing preference (${holisticData.flight_timing_preference})
2. Ensures timely arrival before the event (Event Date: ${holisticData.event_date}, Event Time: ${holisticData.event_time})
3. Is suitable for a group of ${holisticData.group_size} people
4. Best fits the event theme: ${holisticData.theme}

IMPORTANT: You MUST select a flight from the available list above. Use the EXACT values from the list (origin_country, origin_airport, destination_country, destination_airport, departure_time, arrival_time, duration, flight_code). 

If flight_code is provided in the list, use the exact value. If not provided, generate a realistic flight code in the format "XX###" where XX is a 2-letter airline code (e.g., CX, AA, BA, UA) and ### is a 3-4 digit number (e.g., CX123, AA456, BA789).

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "origin_country": "Exact origin_country from selected flight",
  "origin_airport": "Exact origin_airport from selected flight",
  "destination_country": "Exact destination_country from selected flight",
  "destination_airport": "Exact destination_airport from selected flight",
  "departure_time": "Exact departure_time from selected flight",
  "arrival_time": "Exact arrival_time from selected flight",
  "duration": 495,
  "flight_code": "CX123"
}

CRITICAL: Use the EXACT values from the available flights list above. If flight_code is in the list, use it exactly. If not, generate a realistic flight code. Select the best flight from the list based on the criteria.
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
    console.error("Failed to parse flight LLM response:", text);
    throw new Error("LLM returned invalid JSON format for flight");
  }

  // Validate the response against our schema
  const validatedFlight = FlightRecommendationSchema.parse(parsedResponse);

  console.log("[recoFlight] Validated flight recommendation:", {
    flight_code: validatedFlight.flight_code,
    origin_country: validatedFlight.origin_country,
    destination_country: validatedFlight.destination_country,
    formId: holisticData.formId,
  });

  // Populate form with flight_id
  if (validatedFlight.flight_code) {
    console.log(
      `[recoFlight] Looking up flight_id for flight_code: ${validatedFlight.flight_code}`
    );
    const flightId = await getFlightIdByFlightCode(validatedFlight.flight_code);
    console.log(`[recoFlight] Flight lookup result:`, {
      flight_code: validatedFlight.flight_code,
      flightId: flightId,
      found: !!flightId,
    });

    if (flightId) {
      console.log(
        `[recoFlight] Updating form ${holisticData.formId} with flight_id: ${flightId}`
      );
      await updateFormWithFlightId(holisticData.formId, flightId);
      console.log(
        `[recoFlight] Successfully updated form ${holisticData.formId} with flight_id: ${flightId}`
      );
    } else {
      console.warn(
        `[recoFlight] Flight with flight_code ${validatedFlight.flight_code} not found in database. Cannot update form.`
      );
    }
  } else {
    console.warn(
      `[recoFlight] No flight_code in validated flight recommendation. Cannot update form with flight_id.`,
      { validatedFlight }
    );
  }

  return validatedFlight;
}
