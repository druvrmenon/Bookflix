import { Outfit, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

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
  title: 'BookFlix — Rent Your Next Great Read',
  description: 'Browse, discover and rent books from our curated catalog. Fiction, non-fiction, Malayalam and English titles available.',
  keywords: ['books', 'rental', 'bookflix', 'reading', 'library'],
}

export default function RootLayout({ children }) {
  const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
  const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID

  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        {children}

        {/* Tawk.to Live Chat Widget */}
        {tawkPropertyId && tawkWidgetId && (
          <Script
            id="tawk-to"
            strategy="lazyOnload"
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
