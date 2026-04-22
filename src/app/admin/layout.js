import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Admin Dashboard — BookFlix',
  description: 'Manage books, availability, and catalog.',
}

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/customer')
  }

  return (
    <>
      <Navbar role="admin" />
      <main className="page">
        <div className="container">
          {children}
        </div>
      </main>
    </>
  )
}
