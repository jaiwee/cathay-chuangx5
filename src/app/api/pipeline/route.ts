import { NextResponse } from "next/server";
import { HolisticDataSchema } from "@/types/pipeline";
import { getFlightRecommendation } from "./steps/flight";
import { getHotelRecommendations } from "./steps/hotel";
import { getCarRentalRecommendation } from "./steps/carrental";

export async function POST(request: Request) {
  try {
    // Parse and validate holistic data input
    const body = await request.json();
    const holisticData = HolisticDataSchema.parse(body);

    // Check for API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Google Gemini API key not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    // Step 1: Get flight recommendation
    console.log("Step 1: Getting flight recommendation...");
    const flight = await getFlightRecommendation(holisticData);
    console.log("Flight recommendation:", flight);

    // Step 2: Get hotel recommendations based on holistic data + flight details
    console.log("Step 2: Getting hotel recommendations...");
    const hotels = await getHotelRecommendations(holisticData, flight);
    console.log("Hotel recommendations:", hotels);

    // Step 3: Get car rental recommendation based on holistic data + flight details
    console.log("Step 3: Getting car rental recommendations...");
    const carRental = await getCarRentalRecommendation(holisticData, flight);
    console.log("Car rental recommendation:", carRental);

    // Return the complete pipeline output
    return NextResponse.json({
      success: true,
      input: holisticData,
      output: {
        flight: {
          route: flight.route,
          departure: flight.departure_time,
          arrival: flight.arrival_time,
          flight_number: flight.flight_number,
        },
        hotels: hotels,
        car_rental: carRental,
      },
    });
  } catch (error: unknown) {
    console.error("Pipeline error:", error);

    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError" &&
      "errors" in error
    ) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Pipeline processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
