import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  HolisticData,
  FlightRecommendation,
  FlightRecommendationSchema,
} from "@/types/pipeline";

export async function getFlightRecommendation(
  holisticData: HolisticData
): Promise<FlightRecommendation> {
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

Based on the above information, recommend a suitable flight. Consider:
1. The flight timing preference (${holisticData.flight_timing_preference})
2. The event date and time to ensure timely arrival
3. Major airports in ${holisticData.origin_country} and ${holisticData.destination_country}
4. Realistic flight numbers and times

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "route": "AIRPORT_CODE to AIRPORT_CODE",
  "departure_time": "YYYY-MM-DD HH:MM AM/PM TIMEZONE",
  "arrival_time": "YYYY-MM-DD HH:MM AM/PM TIMEZONE",
  "flight_number": "XX123"
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
    console.error("Failed to parse flight LLM response:", text);
    throw new Error("LLM returned invalid JSON format for flight");
  }

  // Validate the response against our schema
  return FlightRecommendationSchema.parse(parsedResponse);
}

