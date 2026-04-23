// Customer layout — wraps all /customer/* pages
// Provides navbar, footer, and auth guard (redirects unauthenticated users to login)

import { redirect } from 'next/navigation' // Server-side redirect
import { createClient } from '@/lib/supabase/server' // Server Supabase client
import Navbar from '@/components/Navbar' // Shared navigation bar
import Footer from '@/components/Footer' // Site footer

// SEO metadata for customer pages
export const metadata = {
  title: 'Catalog — BookFlix',
  description: 'Browse and rent books from our curated catalog.',
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

  return (
    // Flex column layout ensures footer sticks to bottom
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Navbar with customer role */}
      <Navbar role="customer" />
      {/* Page content — grows to fill space */}
      <main className="page" style={{ flex: 1 }}>
        <div className="container">
          {children}
        </div>
      </main>
      {/* Footer at bottom */}
      <Footer />
    </div>
  )
}
