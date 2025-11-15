import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  HolisticData,
  FlightRecommendation,
  HotelRecommendation,
  HotelRecommendationSchema,
  HotelDB,
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

// Fetch available hotels from Supabase
async function getAvailableHotels(
  destinationCountry: string
): Promise<HotelDB[]> {
  const supabase = getSupabaseClient();

  // Build query - filter by destination country
  const { data, error } = await supabase
    .from("hotel")
    .select("*")
    .eq("country", destinationCountry);

  if (error) {
    console.error("Error fetching hotels from Supabase:", error);
    throw new Error(`Failed to fetch hotels: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn(`No hotels found for country: ${destinationCountry}`);
    return [];
  }

  return data as HotelDB[];
}

export async function getHotelRecommendations(
  holisticData: HolisticData,
  flight: FlightRecommendation
): Promise<HotelRecommendation[]> {
  // Fetch available hotels from Supabase
  const availableHotels = await getAvailableHotels(flight.destination_country);

  if (availableHotels.length === 0) {
    throw new Error(
      `No hotels available in ${flight.destination_country}. Please ensure hotel data exists in the database.`
    );
  }

  // Format hotels for the LLM prompt
  const hotelsListString = availableHotels
    .map(
      (hotel, index) =>
        `${index + 1}. Name: ${hotel.name}, Address: ${hotel.address}, City: ${
          hotel.city
        }, Country: ${hotel.country}, Rating: ${hotel.rating}, Price: $${(
          hotel.price_per_nigh / 100
        ).toFixed(2)}/night, Amenities: ${hotel.amenities.join(
          ", "
        )}, Booking URL: ${hotel.booking_url}`
    )
    .join("\n");

  const prompt = `
You are a hotel recommendation assistant helping travelers find the best accommodations near their event.

Event Details:
- Theme: ${holisticData.theme}
- Event Name: ${holisticData.event_name}
- Event Date: ${holisticData.event_date}
- Event Time: ${holisticData.event_time}
- Event Venue: ${holisticData.event_location.address}, ${holisticData.event_location.country}
- Group Size: ${holisticData.group_size}

Flight Details (for context):
- Origin: ${flight.origin_airport}, ${flight.origin_country}
- Destination: ${flight.destination_airport}, ${flight.destination_country}
- Arrival: ${flight.arrival_time}
- Duration: ${flight.duration} minutes

Available Hotels in ${flight.destination_country} (SELECT EXACTLY 3 from this list):
${hotelsListString}

Based on this information, select EXACTLY 3 hotels from the available list above that best match the criteria. Consider:
1. Proximity to ${holisticData.event_location.address} - calculate the distance_to_ev in meters based on the hotel address and event venue address
2. Quality and rating (aim for highly-rated hotels, 4.0-5.0)
3. Appropriate for ${holisticData.theme} event attendees
4. Suitable amenities for a group of ${holisticData.group_size}
5. Price appropriateness for the event theme

IMPORTANT: You MUST select hotels from the available list above. Use the EXACT values from the list (name, address, city, country, rating, booking_url, price_per_nigh, amenities). 

For each selected hotel, you MUST also calculate:
- distance_to_ev: Calculate the distance in meters from the hotel address to the event venue address (${holisticData.event_location.address}). Provide a realistic estimate based on the addresses.

IMPORTANT CONSTRAINTS:
- rating: Must be a number between 0.0 and 5.0 (inclusive). Use the exact rating from the available list.
- booking_url: Must be a valid URL string. Use the exact booking_url from the available list. If the booking_url from the list is null or empty, use "https://example.com/booking" as a placeholder.

Respond ONLY with valid JSON array with EXACTLY 3 hotel objects in this exact format (no markdown, no code blocks, no extra text):
[
  {
    "name": "Exact hotel name from available list",
    "address": "Exact address from available list",
    "city": "Exact city from available list",
    "country": "Exact country from available list",
    "distance_to_ev": 1500,
    "rating": 4.5,
    "booking_url": "Exact booking_url from available list",
    "price_per_nigh": 15000,
    "amenities": ["Exact", "amenities", "array", "from", "available", "list"]
  },
  {
    "name": "Second hotel name from available list",
    "address": "Second hotel address from available list",
    "city": "Second hotel city from available list",
    "country": "Second hotel country from available list",
    "distance_to_ev": 2500,
    "rating": 4.3,
    "booking_url": "Second hotel booking_url from available list",
    "price_per_nigh": 25000,
    "amenities": ["Second", "hotel", "amenities", "array"]
  },
  {
    "name": "Third hotel name from available list",
    "address": "Third hotel address from available list",
    "city": "Third hotel city from available list",
    "country": "Third hotel country from available list",
    "distance_to_ev": 3200,
    "rating": 4.0,
    "booking_url": "Third hotel booking_url from available list",
    "price_per_nigh": 8000,
    "amenities": ["Third", "hotel", "amenities", "array"]
  }
]

CRITICAL: 
- Use the EXACT values from the available hotels list above for: name, address, city, country, rating, booking_url, price_per_nigh, amenities
- CALCULATE distance_to_ev: Estimate the distance in meters from the hotel address to the event venue (${holisticData.event_location.address})
- Select the 3 best hotels from the list based on the criteria
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
    console.error("Failed to parse hotel LLM response:", text);
    throw new Error("LLM returned invalid JSON format for hotels");
  }

  // Validate it's an array
  if (!Array.isArray(parsedResponse)) {
    throw new Error("Hotel recommendations must be an array");
  }

  // Validate we have exactly 3 hotels
  if (parsedResponse.length !== 3) {
    throw new Error(
      `Expected exactly 3 hotels, but got ${parsedResponse.length}`
    );
  }

  // Validate each hotel against the schema
  const validatedHotels = parsedResponse.map((hotel, index) => {
    try {
      // Pre-process hotel data to fix common issues
      const processedHotel = {
        ...hotel,
        // Ensure rating is within valid range (0-5)
        rating: Math.max(0, Math.min(5, Number(hotel.rating) || 0)),
        // Ensure booking_url is a valid string (not null)
        booking_url: hotel.booking_url || "https://example.com/booking",
        // Ensure distance_to_ev is a non-negative integer
        distance_to_ev: Math.max(
          0,
          Math.floor(Number(hotel.distance_to_ev) || 0)
        ),
        // Ensure price_per_nigh is a non-negative integer
        price_per_nigh: Math.max(
          0,
          Math.floor(Number(hotel.price_per_nigh) || 0)
        ),
      };

      return HotelRecommendationSchema.parse(processedHotel);
    } catch (error) {
      console.error(`Hotel ${index + 1} validation failed:`, error);
      console.error(`Hotel ${index + 1} data:`, JSON.stringify(hotel, null, 2));
      throw new Error(`Hotel ${index + 1} does not match the required schema`);
    }
  });

  return validatedHotels;
}
