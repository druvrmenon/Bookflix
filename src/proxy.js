// Proxy (replaces middleware in Next.js 16+)
// Runs before every request to refresh the Supabase auth session
// Keeps session cookies in sync so the user stays logged in

import { createServerClient } from '@supabase/ssr' // SSR-compatible Supabase client
import { NextResponse } from 'next/server' // Next.js response helper

// Proxy function — runs on every matched request
export async function proxy(request) {
  // Read Supabase credentials
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip Supabase session refresh if not configured
  if (!url || !key || !url.startsWith('http')) {
    return NextResponse.next({ request }) // Pass through without modification
  }

  // Create initial response (will be replaced if cookies change)
  let supabaseResponse = NextResponse.next({ request })

  // Create Supabase client with cookie handling
  const supabase = createServerClient(url, key, {
    cookies: {
      // Read cookies from the incoming request
      getAll() {
        return request.cookies.getAll()
      },
      // Write updated session cookies to both the request and response
      setAll(cookiesToSet) {
        // Update request cookies (for downstream server components)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        // Create new response with updated request
        supabaseResponse = NextResponse.next({ request })
        // Set cookies on the response (sent back to browser)
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh the session — this triggers cookie updates if token is stale
  await supabase.auth.getUser()

  // Return response with refreshed session cookies
  return supabaseResponse
}

// Configure which routes the proxy runs on
// Excludes static assets and images for performance
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
