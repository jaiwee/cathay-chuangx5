import { z } from "zod";

// Shared holistic data object used across all pipeline steps
export const HolisticDataSchema = z.object({
  theme: z.enum(["sports", "music", "corporate"]),
  event_name: z.string(),
  event_date: z.string(),
  event_time: z.string(),
  event_location: z.object({
    country: z.string(),
    address: z.string(),
  }),
  origin_country: z.string(),
  destination_country: z.string(),
  flight_timing_preference: z.enum(["morning", "afternoon", "evening"]),
  group_size: z.number(),
  hasEntertainment: z.boolean().default(true),
  hasCulinary: z.boolean().default(true),
  hasMerchandise: z.boolean().default(true),
  formId: z.number().describe("Form ID from the form table"),
});

export type HolisticData = z.infer<typeof HolisticDataSchema>;

// Flight recommendation output - matches Supabase flight relation schema
export const FlightRecommendationSchema = z.object({
  id: z
    .string()
    .uuid()
    .optional()
    .describe("Flight ID (UUID, auto-generated if not provided)"),
  origin_country: z.string().describe("Origin country name"),
  origin_airport: z.string().describe("Origin airport code (e.g., JFK, LAX)"),
  destination_country: z.string().describe("Destination country name"),
  destination_airport: z
    .string()
    .describe("Destination airport code (e.g., LHR, CDG)"),
  departure_time: z
    .string()
    .describe("Departure time in ISO 8601 format (e.g., 2024-01-15T10:30:00Z)"),
  arrival_time: z
    .string()
    .describe("Arrival time in ISO 8601 format (e.g., 2024-01-15T18:45:00Z)"),
  duration: z
    .number()
    .int()
    .positive()
    .describe("Flight duration in minutes (int8)"),
  flight_code: z.string().describe("Flight code (e.g., CX123, AA456, BA789)"),
});

export type FlightRecommendation = z.infer<typeof FlightRecommendationSchema>;

// Flight database schema (matches Supabase flight table)
export interface FlightDB {
  id?: string; // uuid (optional, auto-generated)
  origin_country: string;
  origin_airport: string;
  destination_country: string;
  destination_airport: string;
  departure_time: string; // ISO 8601 timestamp string
  arrival_time: string; // ISO 8601 timestamp string
  duration: number; // int8 in minutes
  flight_code?: string; // Optional flight code (e.g., CX123, AA456)
}

// Hotel recommendation output - matches Supabase hotel relation schema
export const HotelRecommendationSchema = z.object({
  name: z.string().describe("Hotel name"),
  address: z.string().describe("Full street address"),
  city: z.string().describe("City name"),
  country: z.string().describe("Country name"),
  distance_to_ev: z
    .number()
    .int()
    .nonnegative()
    .describe("Distance to event venue in meters (int4)"),
  rating: z.number().min(0).max(10).describe("Hotel rating out of 10 (float4)"),
  booking_url: z.string().url().describe("Booking URL for the hotel"),
  price_per_night: z
    .number()
    .int()
    .nonnegative()
    .describe("Price per night in dollars (int4)"),
  amenities: z
    .array(z.string())
    .describe("Array of amenity names (stored as JSON)"),
});

export type HotelRecommendation = z.infer<typeof HotelRecommendationSchema>;

// Hotel database schema (matches Supabase hotel table)
export interface HotelDB {
  id?: string; // uuid (optional, auto-generated)
  name: string;
  address: string;
  city: string;
  country: string;
  rating: number; // float4
  booking_url: string;
  price_per_night: number; // int4 - price in dollars
  amenities: string[]; // JSON array
  // Note: distance_to_ev and price_band are calculated by AI, not stored in DB
}

// Car rental database schema (matches Supabase car_rental table)
export interface CarRentalDB {
  model_name: string;
  provider_name: string;
  service_type: string; // e.g., "sedan", "suv", "van"
  city: string;
  country: string;
  price_per_day: number; // int8
  booking_url: string;
  miles_eligible: number; // int8
}

// Car model for LLM prompt (derived from DB data)
export interface CarModel {
  model_name: string;
  provider_name: string;
  service_type: string; // e.g., "sedan", "suv", "van"
  city: string;
  country: string;
  price_per_day: number; // int8 from DB
  booking_url: string;
  miles_eligible: number; // int8
}

// Car rental recommendation output
export const CarRentalRecommendationSchema = z.object({
  recommended_combination: z.array(
    z.object({
      model: z.string().describe("Car model name"),
      type: z.string().describe("Car type (sedan, suv, van, etc)"),
      quantity: z.number().describe("Number of cars to rent"),
      capacity: z.number().describe("Passenger capacity per car"),
      total_capacity: z.number().describe("Total capacity for this car type"),
      price_per_day: z.string().describe("Price per day"),
    })
  ),
  total_cars: z.number().describe("Total number of cars in combination"),
  total_capacity: z.number().describe("Total passenger capacity"),
  reasoning: z.string().describe("Explanation for this combination"),
});

export type CarRentalRecommendation = z.infer<
  typeof CarRentalRecommendationSchema
>;

// Flight activity (mock data)
export interface FlightActivity {
  name: string;
  duration: string; // e.g., "30 minutes"
  description: string;
  cathay_shop_items: string[]; // merchandise to promote
}

// Flight activity database schema (matches Supabase flight_activity table)
export interface FlightActivityDB {
  id?: string; // uuid (optional)
  activity_name: string;
  type: string; // activity_type enum: "entertainment", "Culinary Experience", "merchandise", etc.
  description?: string; // Optional base description
}

// Cathay shop item database schema
export interface CathayShopItemDB {
  id?: string; // uuid (optional)
  item_name: string;
  description?: string;
  category?: string;
}

// Flight schedule recommendation output
export const FlightScheduleSchema = z.object({
  schedule: z.array(
    z.object({
      startTime: z
        .string()
        .describe(
          "Start time in timestamptz format (ISO 8601 with timezone, e.g., '2024-01-15T10:00:00Z')"
        ),
      duration: z
        .number()
        .int()
        .positive()
        .describe("Duration in minutes (integer, e.g., 30)"),
      activityName: z.string().describe("Name of the activity"),
      description: z.string().describe("Description of the activity"),
      featured_cathay_items: z
        .string()
        .nullish()
        .describe(
          "Optional string - Single Cathay shop item name featured in this activity (can be null)"
        ),
    })
  ),
});

export type FlightSchedule = z.infer<typeof FlightScheduleSchema>;

// Complete pipeline output
export interface PipelineOutput {
  flight: FlightRecommendation;
  hotels: HotelRecommendation[];
  car_rental: CarRentalRecommendation;
  flight_schedule: FlightSchedule;
}
