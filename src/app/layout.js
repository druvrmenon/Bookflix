// Root layout — wraps entire app
// Sets up fonts, metadata, and optional analytics
import { Outfit, Inter } from 'next/font/google'
import './globals.css'
import PWARegistration from '@/components/PWARegistration'
import CookieConsent from '@/components/CookieConsent'
import ClientAnalytics from '@/components/ClientAnalytics'
import PresenceTracker from '@/components/PresenceTracker'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://bookflix.in'),
  title: 'BookFlix — Rent Your Next Great Read',
  description: 'Browse, discover and rent books from our curated catalog. Fiction, non-fiction, Malayalam and English titles available.',
  keywords: ['books', 'rental', 'bookflix', 'reading', 'library'],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'BookFlix — Rent Your Next Great Read',
    description: 'Browse, discover and rent books from our curated catalog.',
    url: 'https://bookflix.in',
    siteName: 'BookFlix',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BookFlix — Book Rental Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookFlix — Rent Your Next Great Read',
    description: 'Browse, discover and rent books from our curated catalog.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BookFlix',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a0a0a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="dns-prefetch" href="https://wlwyvbrpatzecobyppgn.supabase.co" />
        <link rel="preconnect" href="https://wlwyvbrpatzecobyppgn.supabase.co" crossOrigin="anonymous" />
      </head>
      <body>
        <PWARegistration />
        <CookieConsent />
        <PresenceTracker />
        {children}
        <ClientAnalytics />
      </body>
    </html>
  )
}
