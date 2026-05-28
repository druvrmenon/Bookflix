// API route: POST /api/rent
// Handles rent request submissions with server-side rate limiting.
// Using an API route (instead of client-side insert) means:
//   - Rate limiting can't be bypassed by modifying client JS
//   - The user's session is verified server-side before any insert

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Max requests a single user can submit within the cooldown window
const MAX_REQUESTS_PER_DAY = 3
const COOLDOWN_HOURS = 24

export async function POST(request) {
  try {
    const supabase = await createClient()

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { book_id, contact_name, phone, address, latitude, longitude, payment_method, payment_status, payment_screenshot_url } = body

    // Basic validation
    if (!book_id || !contact_name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 })
    }

    // Rate limit: count how many requests this user made in the last 24 hours
    const since = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('rent_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since)

    if (count >= MAX_REQUESTS_PER_DAY) {
      return NextResponse.json(
        { error: `You can only submit ${MAX_REQUESTS_PER_DAY} rent requests per day. Please try again later.` },
        { status: 429 }
      )
    }

    // Check for existing pending request for the same book
    const { data: existing } = await supabase
      .from('rent_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_id', book_id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'You already have a pending request for this book.' }, { status: 409 })
    }

    // Insert the rent request
    const { error: insertError } = await supabase
      .from('rent_requests')
      .insert({
        user_id: user.id,
        book_id,
        contact_name: contact_name.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        latitude,
        longitude,
        payment_method: payment_method || 'cash',
        payment_status: payment_status || 'unpaid',
        payment_screenshot_url: payment_screenshot_url || null,
      })

    if (insertError) throw insertError

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/rent]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
