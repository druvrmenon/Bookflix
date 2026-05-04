import Navbar from '@/components/Navbar' // Shared navigation bar
import Footer from '@/components/Footer' // Site footer

// SEO metadata for browse pages
export const metadata = {
  title: 'Browse Catalog — BookFlix',
  description: 'Browse our curated catalog. Fiction, non-fiction, Malayalam and English titles.',
}

export default function BrowseLayout({ children }) {
  return (
    // Flex column layout ensures footer sticks to bottom
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Navbar with guest role (no role string means it will just show login/signup links) */}
      <Navbar />
      {/* Page content — grows to fill space */}
      <main className="page" style={{ flex: 1 }}>
        <div className="container">
          {children}
        </div>
      </main>
      {/* Footer at bottom */}
      <Footer />
    </div>
  )
}
