// Landing page — shown to unauthenticated users
// Redirects logged-in users to their role-appropriate dashboard
// This is a Server Component — runs on the server for fast initial load

import Link from 'next/link' // Next.js optimized link
import Image from 'next/image'
import { redirect } from 'next/navigation' // Server-side redirect
import { createClient } from '@/lib/supabase/server' // Server Supabase client
import BookCard from '@/components/BookCard'
import ComingSoon from '@/components/ComingSoon'
import { LAUNCH_DATE, LAUNCHED } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Create Supabase client with cookie-based session
  const supabase = await createClient()

  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // User is logged in — fetch their role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned') // Fetch both role and ban status
      .eq('id', user.id) // Match by user ID
      .single() // Expect exactly one result

    // Redirect to role-appropriate dashboard
    if (profile?.is_banned) {
      redirect('/banned')
    } else if (profile?.role === 'admin') {
      redirect('/admin') // Admin goes to admin dashboard
    } else {
      redirect('/customer') // Customer goes to catalog
    }
  }

  // Coming soon check — bail early, no need to fetch books
  const targetDate = LAUNCH_DATE
  const isComingSoon = !LAUNCHED && new Date() < new Date(targetDate)

  if (isComingSoon) {
    return <ComingSoon targetDate={targetDate} />
  }

  // Fetch recent books for the public catalog preview
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('available', { ascending: false }) // Push unavailable down
    .order('created_at', { ascending: false })
    .limit(10) // Show top 10 newest books

  // User is NOT logged in — show hero landing page with catalog preview
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BookFlix',
    url: 'https://bookflix.in',
    logo: 'https://bookflix.in/logo.png',
    description: "Kerala's curated online book rental platform. Rent Malayalam and English books.",
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Malayalam'],
    },
  }

  return (
    <div className="landing-page fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="hero" style={{ minHeight: 'auto', padding: '80px 16px 60px' }}>
        <div className="hero-logo-wrap" style={{ marginBottom: '24px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <Image 
            src="/logo.png" 
            alt="BookFlix Logo" 
            width={180} 
            height={60} 
            priority
            className="hero-logo-img"
          />
        </div>
        <h1>BookFlix — Your Next Great Read Awaits</h1>
        <p className="hero-subtitle">
          Discover and rent from our curated collection of books.
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
          {books?.map((book, index) => (
            <BookCard 
              key={book.id} 
              book={book} 
              priority={index < 4}
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
