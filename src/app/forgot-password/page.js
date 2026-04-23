// Forgot password page — sends password reset email via Supabase
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      setSent(true) // Show success state
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <img src="/logo.png" alt="BookFlix Logo" />
        </div>
        <h1>Forgot Password</h1>

        {sent ? (
          // Success state
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', color: 'var(--rose-gold)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <p className="auth-subtitle">
              Check your email! We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link href="/login" className="btn btn-secondary mt-3">Back to Login</Link>
          </div>
        ) : (
          // Email form
          <>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-error">{error}</div>}
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">Email</label>
                <input id="reset-email" className="form-input" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  required autoComplete="email" />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading && <span className="spinner"></span>}
                Send Reset Link
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          <Link href="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
