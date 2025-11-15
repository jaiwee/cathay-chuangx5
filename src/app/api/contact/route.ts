import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/contact - Submit contact form
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body
    
    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }
    
    // Save to Supabase (uncomment when you have a 'contacts' table)
    // const { data, error } = await supabase
    //   .from('contacts')
    //   .insert([{
    //     name,
    //     email,
    //     message,
    //     created_at: new Date().toISOString()
    //   }])
    //   .select()
    
    // if (error) {
    //   console.error('Supabase error:', error)
    //   return NextResponse.json(
    //     { error: 'Failed to save contact' },
    //     { status: 500 }
    //   )
    // }
    
    // For now, just log it
    console.log('Contact form submission:', { name, email, message })
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

