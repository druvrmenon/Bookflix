// Server-side Supabase client
// Used in Server Components and layouts for secure auth checks
// Handles cookies for session management automatically

import { createServerClient } from '@supabase/ssr' // SSR-compatible server client
import { cookies } from 'next/headers' // Next.js cookie API for reading/writing cookies

// Create and return a Supabase client for server-side use
// Must be called with `await` because cookies() is async in Next.js 14+
export async function createClient() {
  // Read Supabase credentials from environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build/prerender, env vars may be placeholder strings
  // Return a mock client so static pages can generate without errors
  if (!url || !key || !url.startsWith('http')) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }), order: async () => ({ data: [], error: null }) }),
      }),
    }
  }

  // Get the cookie store from the incoming request
  const cookieStore = await cookies()

  // Create real Supabase server client with cookie-based session handling
  return createServerClient(url, key, {
    cookies: {
      // Read all cookies — Supabase needs these to verify the user's session
      getAll() {
        return cookieStore.getAll()
      },
      // Write cookies — updates session tokens after refresh
      setAll(cookiesToSet) {
        try {
          // Set each cookie in the response
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll can fail when called from a Server Component (read-only context)
          // This is safe to ignore — cookies will be set by the proxy instead
        }
      },
    },
  })
}
