// Add New Book page — renders the BookForm component in create mode
// This is a Server Component — no data fetching needed (form is client-side)

import BookForm from '@/components/BookForm' // Admin book form component
import Link from 'next/link' // Next.js optimized link

// SEO metadata
export const metadata = {
  title: 'Add Book — BookFlix Admin', // Browser tab title
}

export default function NewBookPage() {
  return (
    <div className="fade-in">
      {/* Back link to admin dashboard */}
      <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', marginBottom: '20px', fontSize: '0.9rem' }}>
        ← Back to Dashboard
      </Link>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Add New Book</h1>
        <p className="page-subtitle">Fill in the details to add a book to the catalog</p>
      </div>
      {/* BookForm with no `book` prop = create mode */}
      <BookForm />
    </div>
  )
}
