'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ShadcnForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Example: Save to Supabase
    // const { data, error } = await supabase
    //   .from('contacts')
    //   .insert([formData])
    
    console.log('Form submitted:', formData)
    setSubmitted(true)
    
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shadcn UI Form</h1>
          <p className="text-muted-foreground">
            This form uses Shadcn UI components - beautifully styled and accessible.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg">
            ✓ Thank you! Your message has been received.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you're thinking..."
                rows={5}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          <p><strong>Route:</strong> /shadcn-form</p>
          <p><strong>File:</strong> src/app/shadcn-form/page.tsx</p>
          <p className="mt-2">
            <strong>Components used:</strong> Button, Input, Label, Textarea
          </p>
        </div>
      </div>
    </div>
  )
}

