// Landing page — shown to unauthenticated users
// Redirects logged-in users to their role-appropriate dashboard
// This is a Server Component — runs on the server for fast initial load

import Link from 'next/link' // Next.js optimized link
import { redirect } from 'next/navigation' // Server-side redirect
import { createClient } from '@/lib/supabase/server' // Server Supabase client

export default async function Home() {
  // Create Supabase client with cookie-based session
  const supabase = await createClient()

  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // User is logged in — fetch their role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role') // Only fetch the role column (faster query)
      .eq('id', user.id) // Match by user ID
      .single() // Expect exactly one result

    // Redirect to role-appropriate dashboard
    if (profile?.role === 'admin') {
      redirect('/admin') // Admin goes to admin dashboard
    } else {
      redirect('/customer') // Customer goes to catalog
    }
  }

  // User is NOT logged in — show hero landing page
  return (
    <div className="hero">
      {/* Category badge */}
      <div className="hero-badge">📚 Book Rental Platform</div>
      {/* Main heading with gradient text */}
      <h1>Your Next Great Read Awaits</h1>
      {/* Subtitle description */}
      <p className="hero-subtitle">
        Discover and rent from our curated collection of books.
        Fiction, non-fiction, Malayalam and English — all in one place.
      </p>
      {/* Call-to-action buttons */}
      <div className="hero-cta">
        <Link href="/customer" className="btn btn-primary">
          Browse Catalog
        </Link>
        <Link href="/login" className="btn btn-secondary">
          Sign In
        </Link>
      </div>
    </div>
  )
}
