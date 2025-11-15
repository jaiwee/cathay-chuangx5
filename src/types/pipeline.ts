import { z } from 'zod'

// Shared holistic data object used across all pipeline steps
export const HolisticDataSchema = z.object({
  theme: z.enum(['sports', 'music', 'corporate']),
  event_name: z.string(),
  event_date: z.string(),
  event_time: z.string(),
  event_location: z.object({
    country: z.string(),
    address: z.string(),
  }),
  origin_country: z.string(),
  destination_country: z.string(),
  flight_timing_preference: z.enum(['morning', 'afternoon', 'evening']),
  group_size: z.number(),
})

export type HolisticData = z.infer<typeof HolisticDataSchema>

// Flight recommendation output
export const FlightRecommendationSchema = z.object({
  route: z.string().describe('Flight route in format "origin_airport to destination_airport"'),
  departure_time: z.string().describe('Departure time in ISO format or readable format'),
  arrival_time: z.string().describe('Arrival time in ISO format or readable format'),
  flight_number: z.string().describe('Flight number (e.g., AA123, BA456)'),
})

export type FlightRecommendation = z.infer<typeof FlightRecommendationSchema>

// Hotel recommendation output
export const HotelRecommendationSchema = z.object({
  name: z.string().describe('Hotel name'),
  address: z.string().describe('Hotel address'),
  distance_to_venue: z.string().describe('Distance from event venue'),
  rating: z.number().describe('Hotel rating out of 5'),
  price_per_night: z.string().describe('Estimated price per night'),
  amenities: z.array(z.string()).describe('Key amenities'),
})

export type HotelRecommendation = z.infer<typeof HotelRecommendationSchema>

// Car model availability (mock data)
export interface CarModel {
  model: string
  type: string // e.g., "sedan", "suv", "van"
  capacity: number // number of passengers
  available: number // number of cars available
  price_per_day: string
}

// Car rental recommendation output
export const CarRentalRecommendationSchema = z.object({
  recommended_combination: z.array(z.object({
    model: z.string().describe('Car model name'),
    type: z.string().describe('Car type (sedan, suv, van, etc)'),
    quantity: z.number().describe('Number of cars to rent'),
    capacity: z.number().describe('Passenger capacity per car'),
    total_capacity: z.number().describe('Total capacity for this car type'),
    price_per_day: z.string().describe('Price per day'),
  })),
  total_cars: z.number().describe('Total number of cars in combination'),
  total_capacity: z.number().describe('Total passenger capacity'),
  reasoning: z.string().describe('Explanation for this combination'),
})

export type CarRentalRecommendation = z.infer<typeof CarRentalRecommendationSchema>

// Complete pipeline output
export interface PipelineOutput {
  flight: FlightRecommendation
  hotels: HotelRecommendation[]
  car_rental: CarRentalRecommendation
}

