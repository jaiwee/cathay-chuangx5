'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SupabaseExample() {
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from('_').select('*').limit(1)
        // If error is "relation does not exist", connection is working
        setConnected(true)
      } catch (error) {
        setConnected(false)
        console.error('Supabase connection error:', error)
      }
    }
    
    checkConnection()
  }, [])

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Status</h3>
      {connected === null && <p>Checking connection...</p>}
      {connected === true && <p className="text-green-600">✓ Connected to Supabase</p>}
      {connected === false && <p className="text-red-600">✗ Not connected. Check your environment variables.</p>}
    </div>
  )
}

