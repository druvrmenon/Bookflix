// Customer layout — wraps all /customer/* pages
// Provides navbar, footer, and auth guard (redirects unauthenticated users to login)

import { redirect } from 'next/navigation' // Server-side redirect
import { createClient } from '@/lib/supabase/server' // Server Supabase client
import Navbar from '@/components/Navbar' // Shared navigation bar
import Footer from '@/components/Footer' // Site footer
import ComingSoon from '@/components/ComingSoon'

// SEO metadata for customer pages
export const metadata = {
  title: 'Book Catalog — BookFlix',
  description: 'Browse and rent books from our curated catalog. Fiction, non-fiction, Malayalam and English titles.',
}

export default async function CustomerLayout({ children }) {
  // Create server-side Supabase client
  const supabase = await createClient()
  // Check if user has a valid session
  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in, redirect to login page
  if (!user) {
    redirect('/login')
  }

  // Fetch role to allow admin bypass
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  // Coming soon check
  const targetDate = '2026-05-12T11:11:00+05:30'
  const isComingSoon = new Date() < new Date(targetDate)
  const shouldBlock = isComingSoon && !isAdmin

  return (
    // Flex column layout ensures footer sticks to bottom
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Navbar with customer role */}
      <Navbar role="customer" />
      {/* Page content — grows to fill space */}
      <main className="page" style={{ flex: 1 }}>
        <div className="container">
          {shouldBlock ? <ComingSoon targetDate={targetDate} showSignOut={true} /> : children}
        </div>
      </main>
      {/* Footer at bottom */}
      <Footer />
    </div>
  )
}
