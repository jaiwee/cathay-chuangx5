# Next.js App Router Guide

## How Next.js Works

Next.js is a **full-stack React framework** that:
- Renders React components on the server (faster initial load)
- Handles routing automatically based on file structure
- Optimizes images, fonts, and scripts
- Provides built-in API routes for backend logic

## App Router: File-Based Routing

The folder structure in `src/app/` determines your URLs:

```
src/app/
├── page.tsx              → /                 (Homepage)
├── layout.tsx            → Wraps all pages
├── demo-form/
│   └── page.tsx          → /demo-form
├── shadcn-form/
│   └── page.tsx          → /shadcn-form
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── page.tsx          → /blog
│   └── [id]/
│       └── page.tsx      → /blog/123
└── api/
    └── hello/
        └── route.ts      → /api/hello (API endpoint)
```

## Special Files

| File            | Purpose                                    |
|-----------------|--------------------------------------------|
| `page.tsx`      | A route that users can visit               |
| `layout.tsx`    | Shared UI (navbar, sidebar, footer)        |
| `loading.tsx`   | Loading state while page loads             |
| `error.tsx`     | Error boundary for this route              |
| `not-found.tsx` | 404 page                                   |
| `route.ts`      | API endpoint (in `api/` folder)            |

## Server vs Client Components

### Server Component (Default)
```tsx
// src/app/users/page.tsx
export default async function UsersPage() {
  // Can fetch data directly - runs on server
  const users = await fetch('https://api.example.com/users')
  
  return <div>Users: {users.length}</div>
}
```

**Pros:**
- ✅ Can access database directly
- ✅ Keep secrets secure (API keys)
- ✅ Faster initial load
- ❌ Can't use onClick, useState, useEffect

### Client Component
```tsx
'use client'  // ← Add this at the top!

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </button>
  )
}
```

**Pros:**
- ✅ Can use React hooks (useState, useEffect)
- ✅ Can handle user interactions (onClick)
- ✅ Interactive forms, modals, etc.
- ❌ Runs in browser (larger bundle size)

## When to Use Each

| Use Server Component For          | Use Client Component For        |
|-----------------------------------|---------------------------------|
| Static content                    | Forms with validation           |
| Fetching data from APIs/DB        | Click handlers                  |
| Displaying blog posts             | State management (useState)     |
| SEO-optimized pages               | Real-time updates               |

## Creating a Form (Step-by-Step)

### 1. Create the folder & file
```bash
mkdir -p src/app/contact
touch src/app/contact/page.tsx
```

### 2. Write your component
```tsx
'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Name:', name)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### 3. Visit the route
Open: `http://localhost:3000/contact`

## Using Supabase in a Form

```tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ContactForm() {
  const [email, setEmail] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ email, created_at: new Date() }])
    
    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Success!', data)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Subscribe</button>
    </form>
  )
}
```

## Demo Forms Created

I've created 2 example forms for you:

1. **Basic Form** → http://localhost:3000/demo-form
   - Uses plain HTML/Tailwind styling
   - Shows basic React form handling

2. **Shadcn Form** → http://localhost:3000/shadcn-form
   - Uses Shadcn UI components
   - Production-ready styling
   - Accessible and responsive

## Adding More Shadcn Components

```bash
# Add individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu

# Browse all components at: https://ui.shadcn.com
```

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check for linting errors
npm run lint
```

## Folder Structure Best Practices

```
src/
├── app/                    # Routes & pages
│   ├── (auth)/            # Route groups (doesn't affect URL)
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   │   └── page.tsx
│   └── api/               # API endpoints
│       └── users/
│           └── route.ts
├── components/            # Reusable components
│   ├── ui/               # Shadcn components
│   └── forms/            # Custom form components
├── lib/                  # Utilities & configs
│   ├── supabase.ts
│   └── utils.ts
└── types/                # TypeScript types
    └── index.ts
```

## Next Steps

1. Visit the demo forms I created
2. Try creating your own page in `src/app/mypage/page.tsx`
3. Add more Shadcn components
4. Connect to Supabase for data storage

Happy coding! 🚀

