// Root layout — wraps entire app
// Sets up fonts, metadata, and optional Tawk.to live chat widget

import { Outfit, Inter } from 'next/font/google' // Google font imports
import Script from 'next/script' // Next.js script optimization component
import './globals.css' // Global stylesheet with design system

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
  title: 'BookFlix — Rent Your Next Great Read', // Page title
  description: 'Browse, discover and rent books from our curated catalog. Fiction, non-fiction, Malayalam and English titles available.', // Search engine description
  keywords: ['books', 'rental', 'bookflix', 'reading', 'library'], // SEO keywords
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
