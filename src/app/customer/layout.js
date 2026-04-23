// Customer layout — wraps all /customer/* pages
// Provides navbar and auth guard (redirects unauthenticated users to login)
// This is a Server Component — auth check happens on the server

import { redirect } from 'next/navigation' // Server-side redirect
import { createClient } from '@/lib/supabase/server' // Server Supabase client
import Navbar from '@/components/Navbar' // Shared navigation bar

// SEO metadata for customer pages
export const metadata = {
  title: 'Catalog — BookFlix', // Browser tab title
  description: 'Browse and rent books from our curated catalog.', // Search engine description
}

// Layout component — renders navbar + children for all customer routes
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
    <>
      {/* Navbar with customer role (shows catalog link) */}
      <Navbar role="customer" />
      {/* Page content area with container for max-width */}
      <main className="page">
        <div className="container">
          {children}
        </div>
      </main>
    </>
  )
}
