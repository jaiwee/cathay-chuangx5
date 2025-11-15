import { NextResponse } from "next/server";
import { HolisticDataSchema } from "@/types/pipeline";
import { getFlightRecommendation } from "./steps/recoFlight";
import { getHotelRecommendations } from "./steps/recoHotel";
import { getCarRentalRecommendation } from "./steps/recoCarRental";
import { generateFlightSchedule } from "./steps/generateFlightSchedule";
import { getLatestFormId } from "@/lib/db-helpers";

export async function POST(request: Request) {
  try {
    // Parse and validate holistic data input
    const body = await request.json();

    // Get formId from latest form record if not provided
    let formId: number = body.formId;
    if (!formId) {
      formId = await getLatestFormId();
      console.log(`Using latest form ID: ${formId}`);
    } else {
      // Ensure formId is a number (convert if it's a string)
      formId = typeof formId === "string" ? parseInt(formId, 10) : formId;
    }

    // Add formId to body before parsing
    const holisticData = HolisticDataSchema.parse({
      ...body,
      formId,
    });

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

    // Step 4: Generate themed flight schedule based on holistic data + flight details
    console.log("Step 4: Generating themed flight schedule...");
    const flightSchedule = await generateFlightSchedule(holisticData, flight);
    console.log("Flight schedule:", flightSchedule);

    // Return the complete pipeline output
    return NextResponse.json({
      success: true,
      input: holisticData,
      output: {
        flight: {
          id: flight.id,
          origin_country: flight.origin_country,
          origin_airport: flight.origin_airport,
          destination_country: flight.destination_country,
          destination_airport: flight.destination_airport,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          duration: flight.duration,
        },
        hotels: hotels,
        car_rental: carRental,
        flight_schedule: flightSchedule,
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
