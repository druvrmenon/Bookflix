'use client'

import { Analytics } from '@vercel/analytics/react'
import { useEffect, useState } from 'react'

export default function ClientAnalytics() {
  const [consent, setConsent] = useState(null)

  useEffect(() => {
    setConsent(localStorage.getItem('cookie-consent'))
    
    // Listen for storage changes in case they accept/reject
    const handleStorageChange = () => {
      setConsent(localStorage.getItem('cookie-consent'))
    }
    
    // Custom event to trigger update without reload
    window.addEventListener('cookie-consent-updated', handleStorageChange)
    return () => window.removeEventListener('cookie-consent-updated', handleStorageChange)
  }, [])

  if (consent === 'rejected') return null
  if (!consent) return null // Wait until they decide

  return <Analytics />
}
