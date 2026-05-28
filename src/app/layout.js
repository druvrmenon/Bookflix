// Root layout — wraps entire app
// Sets up fonts, metadata, and optional analytics
import { Outfit, Inter } from 'next/font/google'
import './globals.css'
import PWARegistration from '@/components/PWARegistration'
import CookieConsent from '@/components/CookieConsent'
import ClientAnalytics from '@/components/ClientAnalytics'
import PresenceTracker from '@/components/PresenceTracker'
import { ToastProvider } from '@/components/Toast'

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
  title: {
    default: 'BookFlix — Rent Books Online | Kerala',
    template: '%s | BookFlix',
  },
  description: 'Rent books online from BookFlix — Kerala\'s curated book rental library. Fiction, non-fiction, Malayalam and English titles delivered to your door.',
  keywords: [
    'book rental', 'rent books online', 'bookflix', 'kerala book rental',
    'malayalam books', 'english books', 'online library kerala',
    'book subscription', 'read books kerala', 'rent novels'
  ],
  authors: [{ name: 'BookFlix', url: 'https://bookflix.in' }],
  creator: 'BookFlix',
  publisher: 'BookFlix',
  alternates: {
    canonical: 'https://bookflix.in',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'BookFlix — Rent Books Online | Kerala',
    description: 'Kerala\'s curated book rental platform. Browse Malayalam and English books, request rentals, and read more for less.',
    url: 'https://bookflix.in',
    siteName: 'BookFlix',
    images: [
      {
        url: 'https://bookflix.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BookFlix — Kerala Book Rental Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookFlix — Rent Books Online | Kerala',
    description: 'Kerala\'s curated book rental platform. Browse Malayalam and English books.',
    images: ['https://bookflix.in/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BookFlix',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a0a0a',
}

// Organization schema — placed in root layout so Google sees it on every page
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BookFlix',
  url: 'https://bookflix.in',
  logo: {
    '@type': 'ImageObject',
    url: 'https://bookflix.in/logo.png',
    width: 1076,
    height: 1076,
  },
  description: "Kerala's curated online book rental platform. Rent Malayalam and English books delivered to your door.",
  sameAs: [
    'https://bookflix.in',
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        {/* Organization schema — tells Google our logo for Knowledge Panel */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <ToastProvider>
          <PWARegistration />
          <CookieConsent />
          <PresenceTracker />
          {children}
          <ClientAnalytics />

        </ToastProvider>
      </body>
    </html>
  )
}
