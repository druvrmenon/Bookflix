// Signup page — create a new customer account
// Uses Supabase auth signUp — profile row is auto-created via database trigger
'use client' // Client component — handles form state and auth API calls

import { useState } from 'react' // React state hook
import { useRouter } from 'next/navigation' // Next.js router for redirects
import Link from 'next/link' // Next.js optimized link
import { createClient } from '@/lib/supabase/client' // Browser Supabase client
import ComingSoon from '@/components/ComingSoon'

export default function SignUpPage() {
  // Form field states
  const [fullName, setFullName] = useState('') // Full name input
  const [email, setEmail] = useState('') // Email input
  const [password, setPassword] = useState('') // Password input
  const [showPassword, setShowPassword] = useState(false) // Password visibility toggle
  const [error, setError] = useState('') // Error message
  const [loading, setLoading] = useState(false) // Loading state
  const router = useRouter() // Router instance
  const supabase = createClient() // Supabase client

  // Form submit handler — create account
  const handleSignUp = async (e) => {
    e.preventDefault() // Prevent page reload
    setLoading(true) // Show spinner
    setError('') // Clear errors

    try {
      // Create new user with Supabase Auth
      // The `full_name` is stored in user metadata
      // A database trigger automatically creates a profiles row
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // Stored in raw_user_meta_data, used by trigger
          },
        },
      })

      if (signUpError) throw signUpError // Throw if signup fails

      // Redirect to customer dashboard (new users are customers by default)
      router.push('/customer')
    } catch (err) {
      setError(err.message || 'Sign up failed') // Show error
    } finally {
      setLoading(false) // Hide spinner
    }
  }

  const targetDate = '2026-05-12T11:11:00+05:30'
  const isComingSoon = new Date() < new Date(targetDate)

  if (isComingSoon) {
    return <ComingSoon targetDate={targetDate} />
  }

  return (
    // Full-page centered auth layout
    <div className="auth-page">
      {/* Auth card with slide-up animation */}
      <div className="auth-card slide-up">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo.png" alt="BookFlix Logo" />
        </div>
        {/* Heading and subtitle */}
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join BookFlix and start reading</p>

        {/* Signup form */}
        <form onSubmit={handleSignUp} className="auth-form">
          {/* Error message banner */}
          {error && <div className="auth-error">{error}</div>}

          {/* Full name field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              className="form-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="name" // Browser autofill hint
            />
          </div>

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="signup-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6} // Supabase requires minimum 6 characters
                autoComplete="new-password"
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11-8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit button with loading spinner */}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading && <span className="spinner"></span>}
            Create Account
          </button>
        </form>

        {/* Link to login page */}
        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
