// Admin layout — wraps all /admin/* pages
// Provides navbar, footer, and double auth guard: must be logged in AND have admin role

import { redirect } from 'next/navigation' // Server-side redirect
import { createClient } from '@/lib/supabase/server' // Server Supabase client
import Navbar from '@/components/Navbar' // Shared navigation bar
import Footer from '@/components/Footer' // Site footer

// SEO metadata for admin pages
export const metadata = {
  title: 'Admin Dashboard — BookFlix',
  description: 'Manage books, availability, and catalog.',
}

export default async function AdminLayout({ children }) {
  // Create server-side Supabase client
  const supabase = await createClient()
  // Check if user has a valid session
  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in, redirect to login page
  if (!user) {
    redirect('/login')
  }

  // Fetch user's role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // If user is NOT an admin, redirect to customer dashboard
  if (profile?.role !== 'admin') {
    redirect('/customer')
  }

  return (
    // Flex column layout ensures footer sticks to bottom
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Navbar with admin role */}
      <Navbar role="admin" />
      {/* Page content */}
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
