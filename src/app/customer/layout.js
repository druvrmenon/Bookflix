import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Catalog — BookFlix',
  description: 'Browse and rent books from our curated catalog.',
}

export default async function CustomerLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Navbar role="customer" />
      <main className="page">
        <div className="container">
          {children}
        </div>
      </main>
    </>
  )
}
