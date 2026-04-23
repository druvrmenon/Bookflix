// Reset password page — user lands here from the email reset link
// Sets a new password using Supabase auth
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })
      if (updateError) throw updateError
      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
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
        <h1>Reset Password</h1>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', color: 'var(--green)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <p className="auth-subtitle">Password updated! Redirecting to login...</p>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">Enter your new password</p>
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-error">{error}</div>}
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <input id="new-password" className="form-input" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  required minLength={6} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                <input id="confirm-password" className="form-input" type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  required minLength={6} autoComplete="new-password" />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading && <span className="spinner"></span>}
                Update Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
