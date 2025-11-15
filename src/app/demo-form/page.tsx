'use client'

import { useState } from 'react'

export default function DemoForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Here you would normally send data to your backend or Supabase
    console.log({ name, email, message })
    
    setSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setName('')
      setEmail('')
      setMessage('')
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Contact Form Demo
        </h1>

        {submitted ? (
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-4 rounded-lg">
            ✓ Form submitted successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium mb-2 text-black dark:text-white"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-white"
                placeholder="Your name"
              />
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2 text-black dark:text-white"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-white"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label 
                htmlFor="message" 
                className="block text-sm font-medium mb-2 text-black dark:text-white"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-white"
                placeholder="Your message here..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Submit
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <strong>Route:</strong> /demo-form
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            <strong>File:</strong> src/app/demo-form/page.tsx
          </p>
        </div>
      </div>
    </div>
  )
}

