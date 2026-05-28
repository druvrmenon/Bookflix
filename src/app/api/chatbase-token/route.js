// API route — generates signed JWT for Chatbase identity verification
// Called client-side after chatbot loads; returns token for window.chatbase('identify')
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    // No logged-in user — return null so client skips identify
    if (error || !user) {
      return NextResponse.json({ token: null })
    }

    const secret = process.env.CHATBOT_IDENTITY_SECRET
    if (!secret) {
      return NextResponse.json({ token: null })
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
      },
      secret,
      { expiresIn: '1h' }
    )

    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ token: null })
  }
}
