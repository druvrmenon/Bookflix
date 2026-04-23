// Admin layout — wraps all /admin/* pages
// Provides navbar and double auth guard: must be logged in AND have admin role
// Non-admins are redirected to customer dashboard

import { redirect } from 'next/navigation' // Server-side redirect
import { createClient } from '@/lib/supabase/server' // Server Supabase client
import Navbar from '@/components/Navbar' // Shared navigation bar

// SEO metadata for admin pages
export const metadata = {
  title: 'Admin Dashboard — BookFlix', // Browser tab title
  description: 'Manage books, availability, and catalog.', // Search description
}

// Layout component — renders navbar + children for all admin routes
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
    .select('role') // Only fetch role column
    .eq('id', user.id) // Match by user ID
    .single() // Expect one result

  // If user is NOT an admin, redirect to customer dashboard
  if (profile?.role !== 'admin') {
    redirect('/customer')
  }

  return (
    <>
      {/* Navbar with admin role (shows Dashboard + Add Book links) */}
      <Navbar role="admin" />
      {/* Page content area */}
      <main className="page">
        <div className="container">
          {children}
        </div>
      </main>
    </>
  )
}
