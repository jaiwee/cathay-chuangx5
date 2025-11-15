# LLM Pipeline Guide

## Overview

This pipeline uses the **Vercel AI SDK** to generate flight recommendations based on event details. It's a single-step LLM pipeline that takes holistic event data and returns structured flight information.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Frontend      │─────▶│   API Endpoint   │─────▶│  Google Gemini   │
│  /pipeline      │      │ /api/pipeline    │      │  (Gemini 1.5)    │
└─────────────────┘      └──────────────────┘      └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Structured Output│
                         │   (Zod Schema)   │
                         └──────────────────┘
```

## Input Data Schema

The pipeline accepts the following fields:

```typescript
{
  theme: "sports" | "music" | "corporate",
  event_name: string,              // e.g., "Coachella"
  event_date: string,               // ISO date format
  event_time: string,               // Time in HH:MM format
  event_location: {
    country: string,                // Event country
    address: string                 // Event address/city
  },
  origin_country: string,           // Departure country
  destination_country: string,      // Arrival country
  flight_timing_preference: "morning" | "afternoon" | "evening",
  group_size: number                // Number of travelers
}
```

## Output Data Schema

The pipeline returns:

```typescript
{
  route: string,                    // e.g., "SIN to LAX"
  departure: string,                // Departure time
  arrival: string,                  // Arrival time
  flight_number: string             // e.g., "SQ12"
}
```

## How It Works

### 1. Frontend Form (`src/app/pipeline/page.tsx`)

- Collects event and travel details from the user
- Validates input data
- Sends POST request to the API endpoint

### 2. API Endpoint (`src/app/api/pipeline/route.ts`)

- Receives and validates input using Zod schema
- Constructs a detailed prompt for the LLM
- Uses Vercel AI SDK's `generateText()` with Google Gemini
- Parses JSON response and validates with Zod schema
- Returns structured output matching the defined schema

### 3. LLM Processing

- Google Gemini 2.5 Flash processes the prompt
- Considers:
  - Flight timing preferences
  - Event date and time for arrival planning
  - Major airports in origin/destination countries
  - Realistic flight schedules
- Returns structured data matching the Zod schema

## Key Technologies

### Vercel AI SDK

- **`generateText()`**: Generates text responses from LLMs
- **Provider support**: Works with Google Gemini via `@ai-sdk/google`
- **Simple integration**: Clean API for LLM interactions
- **Type safety**: Full TypeScript support

### Zod

- Runtime type validation
- Schema definition for input and output
- Error handling and validation messages

### Google Gemini

- Model: `gemini-2.5-flash` (latest stable version)
- Fast and efficient text generation
- Accessed via `@ai-sdk/google` provider
- Free tier available with generous limits
- Returns JSON formatted responses

## Setup Instructions

### 1. Install Dependencies

```bash
npm install ai @ai-sdk/google zod
```

### 2. Configure Environment Variables

Add to `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your-google-gemini-api-key-here
```

Get your API key from: https://aistudio.google.com/app/apikey

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Access the Pipeline

Visit: http://localhost:3000/pipeline

## Usage Example

### Example Input:

```json
{
  "theme": "music",
  "event_name": "Coachella 2024",
  "event_date": "2024-04-12",
  "event_time": "18:00",
  "event_location": {
    "country": "United States",
    "address": "Indio, California"
  },
  "origin_country": "Singapore",
  "destination_country": "United States",
  "flight_timing_preference": "morning",
  "group_size": 4
}
```

### Example Output:

```json
{
  "route": "SIN (Singapore) to LAX (Los Angeles)",
  "departure": "2024-04-11 10:00 AM SGT",
  "arrival": "2024-04-11 08:30 AM PDT",
  "flight_number": "SQ12"
}
```

## File Structure

```
src/
├── app/
│   ├── pipeline/
│   │   └── page.tsx              # Frontend form
│   └── api/
│       └── pipeline/
│           └── route.ts          # LLM pipeline endpoint
└── components/
    └── ui/                       # Shadcn UI components
```

## Error Handling

The pipeline includes comprehensive error handling:

1. **Input Validation**: Zod validates all input data
2. **API Key Check**: Ensures OpenAI API key is configured
3. **LLM Errors**: Catches and reports generation failures
4. **Type Safety**: TypeScript ensures type correctness

## Extending the Pipeline

### Adding More Steps

To create a multi-step pipeline:

```typescript
// Step 1: Generate flight options
const flights = await generateObject({
  /* ... */
});

// Step 2: Filter by budget
const filtered = await generateObject({
  prompt: `Filter these flights: ${flights}`,
  /* ... */
});

// Step 3: Add accommodation
const complete = await generateObject({
  prompt: `Add hotels near event: ${filtered}`,
  /* ... */
});
```

### Adding Different Providers

Vercel AI SDK supports multiple LLM providers:

```typescript
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

// Use OpenAI
const result = await generateObject({
  model: openai("gpt-4o"),
  // ...
});

// Use Claude
const result = await generateObject({
  model: anthropic("claude-3-sonnet"),
  // ...
});
```

## Testing

Visit http://localhost:3000/pipeline and try:

1. **Sports Event**: UEFA Champions League Final
2. **Music Festival**: Coachella, Glastonbury
3. **Corporate Event**: Tech conference in San Francisco

## Troubleshooting

### "Google Gemini API key not configured"

- Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is in `.env.local`
- Restart the dev server after adding env variables

### "Invalid input data"

- Check that all required fields are filled
- Verify date and time formats are correct

### Pipeline takes too long

- `gemini-2.5-flash` is already optimized for speed
- Check your Google AI quota and rate limits
- Consider using caching for repeated requests

## Next Steps

- Add hotel recommendations
- Include car rental suggestions
- Add budget estimation
- Save recommendations to Supabase
- Send email notifications

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Zod Documentation](https://zod.dev)
