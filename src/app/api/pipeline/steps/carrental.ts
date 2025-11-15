import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  HolisticData,
  FlightRecommendation,
  CarRentalRecommendation,
  CarModel,
} from "@/types/pipeline";

// Mock data for available car models
const AVAILABLE_CARS: CarModel[] = [
  {
    model: "Toyota Camry",
    type: "sedan",
    capacity: 5,
    available: 10,
    price_per_day: "$45",
  },
  {
    model: "Honda Accord",
    type: "sedan",
    capacity: 5,
    available: 8,
    price_per_day: "$42",
  },
  {
    model: "Chevrolet Suburban",
    type: "suv",
    capacity: 7,
    available: 5,
    price_per_day: "$85",
  },
  {
    model: "Ford Explorer",
    type: "suv",
    capacity: 7,
    available: 6,
    price_per_day: "$75",
  },
  {
    model: "Mercedes Sprinter",
    type: "van",
    capacity: 12,
    available: 3,
    price_per_day: "$120",
  },
  {
    model: "Toyota Sienna",
    type: "van",
    capacity: 8,
    available: 4,
    price_per_day: "$65",
  },
  {
    model: "Tesla Model 3",
    type: "sedan",
    capacity: 5,
    available: 7,
    price_per_day: "$65",
  },
  {
    model: "Jeep Wrangler",
    type: "suv",
    capacity: 5,
    available: 4,
    price_per_day: "$70",
  },
];

export async function getCarRentalRecommendation(
  holisticData: HolisticData,
  flight: FlightRecommendation
): Promise<CarRentalRecommendation> {
  const prompt = `
You are a car rental recommendation assistant helping travelers choose the best combination of vehicles for their trip.

Event Details:
- Theme: ${holisticData.theme}
- Event Name: ${holisticData.event_name}
- Event Date: ${holisticData.event_date}
- Event Location: ${holisticData.event_location.address}, ${holisticData.event_location.country}
- Group Size: ${holisticData.group_size} people

Flight Details (for context):
- Arrival: ${flight.arrival_time}
- Route: ${flight.route}

Available Car Models and Inventory:
${AVAILABLE_CARS.map(
  (car) =>
    `- ${car.model} (${car.type}, ${car.capacity} passengers) - ${car.available} available at ${car.price_per_day}/day`
).join("\n")}

Based on this information, recommend the BEST COMBINATION of rental cars for the group. Consider:
1. The group size is ${holisticData.group_size} people - ensure sufficient capacity
2. Cost efficiency - minimize number of cars while maintaining comfort
3. Event appropriateness - ${holisticData.theme} event may have specific needs
4. Availability constraints - don't exceed available inventory
5. Mix of vehicle types if beneficial (e.g., SUV for luggage + sedans for smaller groups)

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "recommended_combination": [
    {
      "model": "Car Model Name",
      "type": "sedan/suv/van",
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

