// Root layout — wraps entire app
// Sets up fonts, metadata, and optional Tawk.to live chat widget

import { Outfit, Inter } from 'next/font/google' // Google font imports
import Script from 'next/script' // Next.js script optimization component
import './globals.css' // Global stylesheet with design system
import PWARegistration from '@/components/PWARegistration'
import CookieConsent from '@/components/CookieConsent'


// Load Outfit font for headings — variable font for performance
const outfit = Outfit({
  subsets: ['latin'], // Only load Latin characters
  variable: '--font-outfit', // CSS variable name for use in styles
  display: 'swap', // Show fallback font until loaded (prevents invisible text)
})

// Load Inter font for body text — variable font for performance
const inter = Inter({
  subsets: ['latin'], // Only load Latin characters
  variable: '--font-inter', // CSS variable name for use in styles
  display: 'swap', // Show fallback font until loaded
})

// SEO metadata — shown in search results and browser tabs
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
  // Open Graph — WhatsApp, Instagram, Discord, Facebook link previews
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
  // Twitter/X card
  twitter: {
    card: 'summary_large_image',
    title: 'BookFlix — Rent Your Next Great Read',
    description: 'Browse, discover and rent books from our curated catalog.',
    images: ['/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  themeColor: '#1a0a0a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BookFlix',
  },
}

// Root layout component — renders on every page
export default function RootLayout({ children }) {
  // Read Tawk.to config from environment variables (optional)
  const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
  const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID

  return (
    // Apply font CSS variables to entire document
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <PWARegistration />
        <CookieConsent />
        {/* Page content renders here */}
        {children}

        {/* Tawk.to Live Chat Widget — only loads if env vars are set */}
        {tawkPropertyId && tawkWidgetId && (
          <Script
            id="tawk-to" // Unique script ID
            strategy="lazyOnload" // Load after page is interactive (doesn't block rendering)
            dangerouslySetInnerHTML={{
              __html: `
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1,s0);
                })();
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}
