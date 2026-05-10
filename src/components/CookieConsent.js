'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already accepted
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    window.dispatchEvent(new Event('cookie-consent-updated'))
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    window.dispatchEvent(new Event('cookie-consent-updated'))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="cookie-consent-container" style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      right: '24px',
      maxWidth: '500px',
      background: 'var(--brown-800)',
      border: '1px solid var(--rose-gold)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      animation: 'slideUp 0.5s ease-out'
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem' }}>🍪</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: 'var(--gray-50)', margin: 0, fontSize: '1rem' }}>Cookie Policy</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            We use cookies to enhance your experience and keep you signed in. By using BookFlix, you agree to our use of cookies.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleReject}
          className="btn btn-secondary" 
          style={{ flex: 1, padding: '8px 16px', fontSize: '0.9rem' }}
        >
          Reject Non-Essential
        </button>
        <button 
          onClick={handleAccept}
          className="btn btn-primary" 
          style={{ flex: 1, padding: '8px 16px', fontSize: '0.9rem' }}
        >
          Accept All
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 640px) {
          .cookie-consent-container {
            left: 16px !important;
            right: 16px !important;
            bottom: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
