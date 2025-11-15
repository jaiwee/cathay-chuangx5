import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  HolisticData,
  FlightRecommendation,
  FlightSchedule,
  FlightActivity,
} from "@/types/pipeline";

// Mock data for available flight activities
const AVAILABLE_ACTIVITIES: FlightActivity[] = [
  {
    name: "Live Music Appreciation Session",
    duration: "45 minutes",
    description: "Interactive session exploring music genres and artists",
    cathay_shop_items: [
      "Cathay Premium Headphones",
      "Music Festival Commemorative T-Shirt",
      "Vinyl Record Collection Set",
    ],
  },
  {
    name: "Sports Trivia Challenge",
    duration: "30 minutes",
    description: "Competitive trivia game about sports history and facts",
    cathay_shop_items: [
      "Cathay Sports Water Bottle",
      "Team Jersey Replica",
      "Sports Magazine Subscription",
    ],
  },
  {
    name: "Cultural Cuisine Tasting Workshop",
    duration: "60 minutes",
    description: "Learn about destination country's culinary traditions",
    cathay_shop_items: [
      "Regional Cookbook",
      "Spice Collection Kit",
      "Cathay Chef's Apron",
    ],
  },
  {
    name: "Destination Discovery Documentary",
    duration: "40 minutes",
    description: "Short film about the destination's culture and attractions",
    cathay_shop_items: [
      "Travel Guide Book",
      "Destination Photo Album",
      "Cultural Souvenir Set",
    ],
  },
  {
    name: "Wellness & Meditation Session",
    duration: "25 minutes",
    description: "Guided meditation and stretching exercises for travelers",
    cathay_shop_items: [
      "Cathay Travel Comfort Kit",
      "Aromatherapy Essential Oils",
      "Meditation Guide Book",
    ],
  },
  {
    name: "Corporate Networking Mixer",
    duration: "50 minutes",
    description: "Facilitated networking for business travelers",
    cathay_shop_items: [
      "Cathay Business Card Holder",
      "Premium Notebook Set",
      "Executive Pen Collection",
    ],
  },
  {
    name: "Festival Fashion Show",
    duration: "35 minutes",
    description: "Showcase of fashion trends and styles for music festivals",
    cathay_shop_items: [
      "Festival Fashion Magazine",
      "Cathay Sunglasses Collection",
      "Trendy Accessories Bundle",
    ],
  },
  {
    name: "Virtual Stadium Tour",
    duration: "45 minutes",
    description: "360° virtual tour of famous sports venues",
    cathay_shop_items: [
      "Stadium Replica Model",
      "Sports History Book",
      "Cathay VR Headset",
    ],
  },
  {
    name: "Mixology Masterclass",
    duration: "40 minutes",
    description: "Learn to make signature cocktails inspired by the destination",
    cathay_shop_items: [
      "Cocktail Recipe Book",
      "Cathay Bar Tools Set",
      "Exotic Bitters Collection",
    ],
  },
  {
    name: "Event Preparation Workshop",
    duration: "30 minutes",
    description: "Tips and insights for making the most of your event experience",
    cathay_shop_items: [
      "Event Survival Guide",
      "Cathay Backpack",
      "Portable Phone Charger",
    ],
  },
];

export async function generateFlightSchedule(
  holisticData: HolisticData,
  flight: FlightRecommendation
): Promise<FlightSchedule> {
  const prompt = `
You are a premium in-flight experience designer for Cathay Pacific, creating a themed flight schedule.

Event Details:
- Theme: ${holisticData.theme}
- Event Name: ${holisticData.event_name}
- Event Date: ${holisticData.event_date}
- Origin: ${holisticData.origin_country}
- Destination: ${holisticData.destination_country}
- Group Size: ${holisticData.group_size}

Flight Details:
- Route: ${flight.route}
- Departure: ${flight.departure_time}
- Arrival: ${flight.arrival_time}
- Flight Number: ${flight.flight_number}

Experience Preferences:
- Entertainment: ${holisticData.hasEntertainment ? "Yes" : "No"}
- Culinary Focus: ${holisticData.hasCulinary ? "Yes" : "No"}
- Activities: ${holisticData.hasActivities ? "Yes" : "No"}

Available In-Flight Activities (choose the most appropriate ones):
${AVAILABLE_ACTIVITIES.map(
  (activity, idx) =>
    `${idx + 1}. ${activity.name} (${activity.duration})
   Description: ${activity.description}
   Shop Items: ${activity.cathay_shop_items.join(", ")}`
).join("\n\n")}

Create a themed flight schedule that:
1. MUST include at least 1 meal inspired by ${holisticData.destination_country} (destination country) cuisine
2. Select 2-3 activities from the list above that best fit the ${holisticData.theme} theme and ${holisticData.event_name} event
3. Theme the overall experience around going to ${holisticData.event_name}
4. Include entertainment suggestions if hasEntertainment is true
5. Make it feel cohesive and exciting for passengers traveling to this event

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "theme_description": "Brief description of the overall flight theme",
  "meals": [
    {
      "timing": "1 hour after takeoff",
      "name": "Meal Name",
      "description": "Description including cultural significance",
      "destination_inspired": true
    }
  ],
  "activities": [
    {
      "name": "Activity Name from the list",
      "start_time": "2 hours after takeoff",
      "end_time": "2.5 hours after takeoff",
      "duration": "30 minutes",
      "description": "Why this activity fits the theme",
      "cathay_shop_items": ["Item 1", "Item 2"]
    }
  ],
  "entertainment": {
    "description": "Entertainment themed for ${holisticData.event_name}",
    "featured_content": ["Movie/Show 1", "Playlist 2", "Documentary 3"]
  }
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
    console.error("Failed to parse flight schedule LLM response:", text);
    throw new Error("LLM returned invalid JSON format for flight schedule");
  }

  // Return the parsed flight schedule
  return parsedResponse as FlightSchedule;
}

