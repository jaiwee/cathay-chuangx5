import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  HolisticData,
  FlightRecommendation,
  FlightSchedule,
  FlightScheduleSchema,
  FlightActivityDB,
  CathayShopItemDB,
} from "@/types/pipeline";
import { insertProposedFlightActivity } from "@/lib/db-helpers";

// Create server-side Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key must be set in environment variables"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist session on server-side
    },
  });
}

// Fetch available flight activities from Supabase
async function getAvailableFlightActivities(
  hasEntertainment: boolean,
  hasCulinary: boolean,
  hasMerchandise: boolean
): Promise<FlightActivityDB[]> {
  const supabase = getSupabaseClient();

  // Build array of activity types to filter by
  // Always include mandatory activities: Takeoff, Landing, and Meal
  const activityTypes: string[] = ["Takeoff", "Landing", "Meal"];

  // Add optional activities based on boolean preferences
  if (hasEntertainment) {
    activityTypes.push("Entertainment");
  }

  if (hasCulinary) {
    activityTypes.push("Culinary Experience");
  }

  if (hasMerchandise) {
    activityTypes.push("Merchandise");
  }

  // Query activities where type (activity_type enum) matches any of the selected types
  const { data, error } = await supabase
    .from("flight_activity")
    .select("*")
    .in("type", activityTypes);

  if (error) {
    console.error("Error fetching flight activities from Supabase:", error);
    throw new Error(`Failed to fetch flight activities: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn(
      `No flight activities found for types: ${activityTypes.join(", ")}`
    );
    return [];
  }

  return data as FlightActivityDB[];
}

// Fetch all Cathay shop items from Supabase
async function getAllCathayShopItems(): Promise<CathayShopItemDB[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from("cathay_shop_item").select("*");

  if (error) {
    console.error("Error fetching Cathay shop items from Supabase:", error);
    throw new Error(`Failed to fetch Cathay shop items: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn("No Cathay shop items found in database");
    return [];
  }

  return data as CathayShopItemDB[];
}

export async function generateFlightSchedule(
  holisticData: HolisticData,
  flight: FlightRecommendation
): Promise<FlightSchedule> {
  // Fetch available flight activities from Supabase
  const availableActivities = await getAvailableFlightActivities(
    holisticData.hasEntertainment,
    holisticData.hasCulinary,
    holisticData.hasMerchandise
  );

  // Fetch all Cathay shop items
  const cathayShopItems = await getAllCathayShopItems();

  // Format activities for the LLM prompt
  const activitiesListString = availableActivities
    .map(
      (activity, index) =>
        `${index + 1}. ${activity.activity_name}${
          activity.description ? ` - ${activity.description}` : ""
        }`
    )
    .join("\n");

  // Format Cathay shop items for the LLM prompt
  const shopItemsListString = cathayShopItems
    .map(
      (item, index) =>
        `${index + 1}. ${item.item_name}${
          item.description ? ` - ${item.description}` : ""
        }`
    )
    .join("\n");

  // Calculate flight duration in hours for scheduling
  const flightDurationHours = flight.duration / 60;

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
- Origin: ${flight.origin_airport}, ${flight.origin_country}
- Destination: ${flight.destination_airport}, ${flight.destination_country}
- Departure: ${flight.departure_time}
- Arrival: ${flight.arrival_time}
- Duration: ${flight.duration} minutes (${flightDurationHours.toFixed(1)} hours)

Experience Preferences:
- Entertainment: ${holisticData.hasEntertainment ? "Yes" : "No"}
- Culinary Focus: ${holisticData.hasCulinary ? "Yes" : "No"}
- Merchandise: ${holisticData.hasMerchandise ? "Yes" : "No"}

MANDATORY Activities (must be included in schedule):
1. Take Off - Must be FIRST in the schedule
2. Taste of the Country - Must be in the MIDDLE of the schedule (destination-inspired meal)
3. Landing - Must be LAST in the schedule

Available Event Activities (select and customize 2-4 activities from this list to fit between Take Off and Landing):
${activitiesListString}

Available Cathay Shop Items (incorporate at least 1 item into at least 1 activity):
${shopItemsListString}

Create a themed flight schedule that:
1. ALWAYS starts with "Take Off" and ends with "Landing"
2. ALWAYS includes "Taste of the Country" meal in the middle portion of the flight
3. Selects 2-4 activities from the available list and customizes their names and descriptions to best fit the ${
    holisticData.theme
  } theme and ${holisticData.event_name} event
4. Incorporates at least 1 Cathay shop item into at least 1 activity (use featured_cathay_items field)
5. Creates realistic timing based on the ${flightDurationHours.toFixed(
    1
  )} hour flight duration
6. Makes the schedule feel cohesive and exciting for passengers traveling to ${
    holisticData.event_name
  }

IMPORTANT: 
- Use timestamptz format (ISO 8601 with timezone) for startTime (e.g., "2024-01-15T10:00:00Z")
- Base times on the flight departure_time: ${flight.departure_time}
- Calculate times relative to the departure time
- duration must be an integer representing minutes (e.g., 15, 30, 60, not "15 minutes")
- Ensure activities don't overlap
- The schedule should fill the entire flight duration appropriately
- featured_cathay_items must be a single string (one item name from the available list) or null/omitted if no item is featured
- At least one activity must have featured_cathay_items populated with one item name

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "schedule": [
    {
      "startTime": "2024-01-15T10:00:00Z",
      "duration": 15,
      "activityName": "Take Off",
      "description": "Flight departure and safety briefing"
    },
    {
      "startTime": "2024-01-15T10:30:00Z",
      "duration": 60,
      "activityName": "Customized Activity Name",
      "description": "Customized description that fits the theme",
      "featured_cathay_items": "Cathay Shop Item Name"
    },
    {
      "startTime": "2024-01-15T12:00:00Z",
      "duration": 60,
      "activityName": "Taste of the Country",
      "description": "Destination-inspired meal featuring cuisine from ${
        holisticData.destination_country
      }"
    },
    {
      "startTime": "2024-01-15T13:30:00Z",
      "duration": 30,
      "activityName": "Another Customized Activity",
      "description": "Another customized description"
    },
    {
      "startTime": "2024-01-15T14:30:00Z",
      "duration": 15,
      "activityName": "Landing",
      "description": "Flight arrival and preparation for disembarkation"
    }
  ]
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

  // Validate the response against our schema
  const validatedSchedule = FlightScheduleSchema.parse(parsedResponse);

  // Populate proposed_flight_activity table with each activity
  for (const activity of validatedSchedule.schedule) {
    await insertProposedFlightActivity(holisticData.formId, {
      startTime: activity.startTime,
      duration: activity.duration,
      activityName: activity.activityName,
      description: activity.description,
      featured_cathay_items: activity.featured_cathay_items || null,
    });
  }

  // Print the output to console
  console.log("Generated Flight Schedule:");
  console.log(JSON.stringify(validatedSchedule, null, 2));
  console.log("\nSchedule Details:");
  validatedSchedule.schedule.forEach((activity, index) => {
    console.log(`${index + 1}. ${activity.activityName}`);
    console.log(`   Start: ${activity.startTime}`);
    console.log(`   Duration: ${activity.duration} minutes`);
    console.log(
      `   Featured Item: ${activity.featured_cathay_items || "None"}`
    );
  });

  return validatedSchedule;
}
