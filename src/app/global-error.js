'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log to console in dev — swap for Sentry/LogRocket in prod if needed
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        background: '#1a0a0a',
        fontFamily: 'system-ui, sans-serif',
        color: '#f5ede8',
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '24px',
        }}>📚</div>

        <h1 style={{ fontSize: '1.8rem', marginBottom: '12px', color: '#f5ede8' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#a89690', maxWidth: '400px', lineHeight: 1.6, marginBottom: '40px' }}>
          An unexpected error occurred. Please try again — if the problem persists, contact support.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              background: '#c9956c',
              color: '#1a0a0a',
              border: 'none',
              borderRadius: '100px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Try Again
          </button>
          <a
            href="/"
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#c9956c',
              border: '1px solid rgba(201,149,108,0.3)',
              borderRadius: '100px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Go Home
          </a>
        </div>
      </body>
    </html>
  )
}
