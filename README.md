This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Beautiful, accessible UI components
- **Supabase** - Backend as a Service (Database, Auth, Storage)
- **Vercel AI SDK** - LLM integration with Google Gemini
- **Google Gemini 2.5 Flash** - AI-powered flight recommendations

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Get your Supabase URL and Anon Key from your [Supabase Dashboard](https://app.supabase.com):
1. Go to your project settings
2. Navigate to API section
3. Copy the `URL` and `anon/public` key

Get your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey):
1. Create an account or sign in
2. Click "Get API key"
3. Copy your API key

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### 🤖 LLM Flight Pipeline
Visit [http://localhost:3000/pipeline](http://localhost:3000/pipeline) to try the AI-powered flight recommendation system.

**Input:**
- Event details (theme, name, date, time, location)
- Travel preferences (origin, destination, timing)
- Group size

**Output:**
- Flight route (airports)
- Departure and arrival times
- Flight number

See [PIPELINE_GUIDE.md](./PIPELINE_GUIDE.md) for detailed documentation.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
