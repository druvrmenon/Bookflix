import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms and Conditions — BookFlix',
  description: 'Terms and Conditions for BookFlix personal book rental platform.',
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
