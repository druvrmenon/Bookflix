// Landing page — shown to unauthenticated users
// Redirects logged-in users to their role-appropriate dashboard
// This is a Server Component — runs on the server for fast initial load

import Link from 'next/link' // Next.js optimized link
import { redirect } from 'next/navigation' // Server-side redirect
import { createClient } from '@/lib/supabase/server' // Server Supabase client
import BookCard from '@/components/BookCard'

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

  // Fetch recent books for the public catalog preview
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10) // Show top 10 newest books

  // User is NOT logged in — show hero landing page with catalog preview
  return (
    <div className="landing-page fade-in">
      {/* Hero Section */}
      <div className="hero" style={{ minHeight: 'auto', padding: '80px 16px 60px' }}>
        <div style={{ marginBottom: '24px' }}>
          <img src="/logo.png" alt="BookFlix Logo" style={{ height: '80px', width: 'auto', margin: '0 auto' }} />
        </div>
        <h1>Your Next Great Read Awaits</h1>
        <p className="hero-subtitle">
          Discover and rent from OUR curated collection of books.
          Fiction, non-fiction, Malayalam and English — all in one place.
        </p>
        <div className="hero-cta">
          <Link href="/signup" className="btn btn-primary">
            Sign Up to Rent
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>
      </div>

      {/* Public Catalog Preview */}
      <div className="container" style={{ padding: '0 16px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="book-grid">
          {books?.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
            />
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/browse" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            View Full Catalog & Sign Up to Rent →
          </Link>
        </div>
      </div>
    </div>
  )
}
