import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Define the output schema
const FlightRecommendationSchema = z.object({
  route: z.string().describe('Flight route in format "origin_airport to destination_airport"'),
  departure_time: z.string().describe('Departure time in ISO format or readable format'),
  arrival_time: z.string().describe('Arrival time in ISO format or readable format'),
  flight_number: z.string().describe('Flight number (e.g., AA123, BA456)'),
})

// Define the input schema
const PipelineInputSchema = z.object({
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

export async function POST(request: Request) {
  try {
    // Parse and validate input
    const body = await request.json()
    const input = PipelineInputSchema.parse(body)

    // Check for API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Gemini API key not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file.' },
        { status: 500 }
      )
    }

    // Create the prompt for the LLM
    const prompt = `
You are a travel planning assistant specializing in flight recommendations for events.

Event Details:
- Theme: ${input.theme}
- Event Name: ${input.event_name}
- Event Date: ${input.event_date}
- Event Time: ${input.event_time}
- Event Location: ${input.event_location.address}, ${input.event_location.country}
- Origin Country: ${input.origin_country}
- Destination Country: ${input.destination_country}
- Flight Timing Preference: ${input.flight_timing_preference}
- Group Size: ${input.group_size}

Based on the above information, recommend a suitable flight. Consider:
1. The flight timing preference (${input.flight_timing_preference})
2. The event date and time to ensure timely arrival
3. Major airports in ${input.origin_country} and ${input.destination_country}
4. Realistic flight numbers and times

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "route": "AIRPORT_CODE to AIRPORT_CODE",
  "departure_time": "YYYY-MM-DD HH:MM AM/PM TIMEZONE",
  "arrival_time": "YYYY-MM-DD HH:MM AM/PM TIMEZONE",
  "flight_number": "XX123"
}
`

    // Generate text using Vercel AI SDK with Google Gemini
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    })

    // Parse the JSON response
    let parsedResponse
    try {
      // Remove any markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsedResponse = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse LLM response:', text)
      throw new Error('LLM returned invalid JSON format')
    }

    // Validate the response against our schema
    const object = FlightRecommendationSchema.parse(parsedResponse)

    // Return the structured response
    return NextResponse.json({
      success: true,
      input: input,
      output: {
        route: object.route,
        departure: object.departure_time,
        arrival: object.arrival_time,
        flight_number: object.flight_number,
      },
    })

  } catch (error: any) {
    console.error('Pipeline error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Pipeline processing failed', message: error.message },
      { status: 500 }
    )
  }
}

