import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/customer')
    }
  }

  return (
    <div className="hero">
      <div className="hero-badge">📚 Book Rental Platform</div>
      <h1>Your Next Great Read Awaits</h1>
      <p className="hero-subtitle">
        Discover and rent from our curated collection of books.
        Fiction, non-fiction, Malayalam and English — all in one place.
      </p>
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
