import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms and Conditions',
  description: 'Read the Terms and Conditions for BookFlix — Kerala\'s personal book rental platform. Rental policies, fees, and user responsibilities.',
  alternates: { canonical: 'https://bookflix.in/terms' },
}

export default function TermsLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Navbar />
      <main className="page" style={{ flex: 1 }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
