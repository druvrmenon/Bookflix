// Signup page — create a new customer account
// Uses Supabase auth signUp — profile row is auto-created via database trigger
'use client' // Client component — handles form state and auth API calls

import { useState } from 'react' // React state hook
import { useRouter } from 'next/navigation' // Next.js router for redirects
import Link from 'next/link' // Next.js optimized link
import { createClient } from '@/lib/supabase/client' // Browser Supabase client

export default function SignUpPage() {
  // Form field states
  const [fullName, setFullName] = useState('') // Full name input
  const [email, setEmail] = useState('') // Email input
  const [password, setPassword] = useState('') // Password input
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
            <input
              id="signup-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6} // Supabase requires minimum 6 characters
              autoComplete="new-password"
            />
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
