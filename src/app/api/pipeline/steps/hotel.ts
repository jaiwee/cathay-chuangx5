import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  HolisticData,
  FlightRecommendation,
  HotelRecommendation,
} from "@/types/pipeline";

export async function getHotelRecommendations(
  holisticData: HolisticData,
  flight: FlightRecommendation
): Promise<HotelRecommendation[]> {
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
- Arrival: ${flight.arrival_time}
- Route: ${flight.route}

Based on this information, recommend 3 hotels near the event venue. Consider:
1. Proximity to ${holisticData.event_location.address}
2. Quality and rating (aim for highly-rated hotels)
3. Appropriate for ${holisticData.theme} event attendees
4. Suitable amenities for a group of ${holisticData.group_size}
5. Realistic pricing for the location

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
[
  {
    "name": "Hotel Name",
    "address": "123 Street Name, City, State/Province",
    "distance_to_venue": "X.X km or X miles",
    "rating": 4.5,
    "price_per_night": "$XXX",
    "amenities": ["WiFi", "Pool", "Gym", "Restaurant"]
  },
  {
    "name": "Hotel Name 2",
    "address": "456 Avenue Name, City, State/Province",
    "distance_to_venue": "X.X km or X miles",
    "rating": 4.3,
    "price_per_night": "$XXX",
    "amenities": ["WiFi", "Breakfast", "Parking"]
  },
  {
    "name": "Hotel Name 3",
    "address": "789 Road Name, City, State/Province",
    "distance_to_venue": "X.X km or X miles",
    "rating": 4.0,
    "price_per_night": "$XXX",
    "amenities": ["WiFi", "Airport Shuttle"]
  }
]
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

  // Return the parsed hotels (validation can be added if needed)
  return parsedResponse as HotelRecommendation[];
}
