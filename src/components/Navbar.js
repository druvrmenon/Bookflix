// Navbar component — responsive navigation bar with role-based links
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar({ role }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Customer navigation links
  const customerLinks = [
    { href: '/customer', label: 'Catalog' },
    { href: '/customer/profile', label: 'Profile' },
  ]

  // Admin navigation links
  const adminLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/book/new', label: 'Add Book' },
    { href: '/admin/users', label: 'Users' },
  ]

  const links = role === 'admin' ? adminLinks : customerLinks

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href={role === 'admin' ? '/admin' : '/customer'} className="navbar-logo">
          <span className="navbar-logo-icon">B</span>
          BookFlix
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="navbar-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user && (
            <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
              Sign Out
            </button>
          )}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="navbar-link"
            onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        {user && (
          <button onClick={handleSignOut} className="btn btn-secondary mt-3">
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}
