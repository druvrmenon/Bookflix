// Login page — email/password authentication
// Uses Supabase auth, fetches user role, and redirects to correct dashboard
'use client' // Client component — handles form state and auth API calls

import { useState } from 'react' // React state hook
import { useRouter } from 'next/navigation' // Next.js router for redirects
import Link from 'next/link' // Next.js optimized link
import Image from 'next/image' // Next.js optimized image
import { createClient } from '@/lib/supabase/client' // Browser Supabase client

export default function LoginPage() {
  // Form field states
  const [email, setEmail] = useState('') // Email input value
  const [password, setPassword] = useState('') // Password input value
  const [showPassword, setShowPassword] = useState(false) // Password visibility toggle
  const [error, setError] = useState('') // Error message to display
  const [loading, setLoading] = useState(false) // Loading spinner state
  const router = useRouter() // Router for programmatic navigation
  const supabase = createClient() // Supabase client

  // Form submit handler — authenticate user and redirect
  const handleLogin = async (e) => {
    e.preventDefault() // Prevent page reload
    setLoading(true) // Show spinner
    setError('') // Clear previous errors

    try {
      // Attempt to sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // Throw if authentication failed (wrong credentials, etc.)
      if (signInError) throw signInError

      // Fetch user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role') // Only fetch role column
        .eq('id', data.user.id) // Match by authenticated user ID
        .single() // Expect one result

      if (profileError) throw profileError // Throw if profile fetch fails

      // Redirect based on user role
      if (profile.role === 'admin') {
        router.push('/admin') // Admin → admin dashboard
      } else {
        router.push('/customer') // Customer → catalog
      }
    } catch (err) {
      setError(err.message || 'Login failed') // Show error to user
    } finally {
      setLoading(false) // Hide spinner
    }
  }

  return (
    // Full-page centered auth layout
    <div className="auth-page">
      {/* Auth card with slide-up animation */}
      <div className="auth-card slide-up">
        {/* Logo */}
        <div className="auth-logo">
          <Image src="/logo.png" alt="BookFlix Logo" width={180} height={60} priority style={{ height: '60px', width: 'auto' }} />
        </div>
        {/* Heading and subtitle */}
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {/* Login form */}
        <form onSubmit={handleLogin} className="auth-form">
          {/* Error message banner */}
          {error && <div className="auth-error">{error}</div>}

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required // Must be filled
              autoComplete="email" // Browser autofill hint
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password" // Browser autofill hint
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit button with loading spinner */}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading && <span className="spinner"></span>}
            Sign In
          </button>
        </form>

        {/* Forgot password link */}
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link href="/forgot-password" style={{ color: 'var(--rose-gold)', fontSize: '0.9rem' }}>
            Forgot your password?
          </Link>
        </div>

        {/* Link to signup page */}
        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}
