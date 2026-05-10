'use client'

import { Analytics } from '@vercel/analytics/react'
import { useEffect, useState } from 'react'
import Script from 'next/script'

const GA_ID = 'G-ZWT8KSXQGW'

export default function ClientAnalytics() {
  const [consent, setConsent] = useState(null)

  useEffect(() => {
    setConsent(localStorage.getItem('cookie-consent'))

    const handleStorageChange = () => {
      setConsent(localStorage.getItem('cookie-consent'))
    }

    window.addEventListener('cookie-consent-updated', handleStorageChange)
    return () => window.removeEventListener('cookie-consent-updated', handleStorageChange)
  }, [])

  if (consent === 'rejected') return null
  if (!consent) return null // Wait until they decide

  return (
    <>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { page_path: window.location.pathname });
      `}</Script>

      {/* Vercel Analytics */}
      <Analytics />
    </>
  )
}
