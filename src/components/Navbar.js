// Navbar component — responsive navigation bar
// Shows role-based links (customer vs admin), sign out button, and mobile hamburger menu
'use client' // Client component because it uses state and event handlers

import { useState, useEffect } from 'react' // React hooks for state and side effects
import Link from 'next/link' // Next.js optimized link component (prefetches pages)
import { useRouter } from 'next/navigation' // Next.js router for programmatic navigation
import { createClient } from '@/lib/supabase/client' // Browser Supabase client

// Navbar accepts a `role` prop to determine which nav links to show
export default function Navbar({ role }) {
  const [menuOpen, setMenuOpen] = useState(false) // Mobile menu open/close state
  const [user, setUser] = useState(null) // Current logged-in user (null if not logged in)
  const router = useRouter() // Router instance for navigation
  const supabase = createClient() // Supabase client for auth operations

  // Fetch current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser() // Get user from session
      setUser(user) // Store user in state
    }
    getUser()
  }, []) // Empty dependency array = runs once on mount

  // Sign out handler — clears session and redirects to login
  const handleSignOut = async () => {
    await supabase.auth.signOut() // Clear Supabase session cookies
    router.push('/login') // Redirect to login page
  }

  // Navigation links for customer role
  const customerLinks = [
    { href: '/customer', label: 'Catalog' }, // Main catalog page
  ]

  // Navigation links for admin role
  const adminLinks = [
    { href: '/admin', label: 'Dashboard' }, // Admin book management
    { href: '/admin/book/new', label: 'Add Book' }, // Add new book form
  ]

  // Select links based on user role
  const links = role === 'admin' ? adminLinks : customerLinks

  return (
    <nav className="navbar">
      {/* Inner container — centers content with max-width */}
      <div className="navbar-inner">
        {/* Logo — links to role-appropriate homepage */}
        <Link href={role === 'admin' ? '/admin' : '/customer'} className="navbar-logo">
          <span className="navbar-logo-icon">B</span>
          BookFlix
        </Link>

        {/* Desktop nav links — hidden on mobile via CSS */}
        <div className="navbar-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="navbar-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: sign out + hamburger */}
        <div className="navbar-actions">
          {/* Only show sign out if user is logged in */}
          {user && (
            <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
              Sign Out
            </button>
          )}
          {/* Hamburger menu button — visible only on mobile */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)} // Toggle mobile menu
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu — visible when hamburger is clicked */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="navbar-link"
            onClick={() => setMenuOpen(false)} // Close menu on link click
          >
            {link.label}
          </Link>
        ))}
        {/* Sign out button inside mobile menu */}
        {user && (
          <button onClick={handleSignOut} className="btn btn-secondary mt-3">
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}
