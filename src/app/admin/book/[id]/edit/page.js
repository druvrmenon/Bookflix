// Edit Book page — fetches existing book data and renders BookForm in edit mode
'use client' // Client component — fetches book data on mount

import { useState, useEffect } from 'react' // React hooks
import { useParams } from 'next/navigation' // Get dynamic route param [id]
import Link from 'next/link' // Next.js optimized link
import { createClient } from '@/lib/supabase/client' // Browser Supabase client
import BookForm from '@/components/BookForm' // Admin book form component

export default function EditBookPage() {
  const { id } = useParams() // Get book ID from URL (e.g., /admin/book/abc-123/edit)
  const supabase = createClient() // Supabase client
  const [book, setBook] = useState(null) // Book data to pre-fill form
  const [loading, setLoading] = useState(true) // Loading state

  // Fetch book data on mount
  useEffect(() => {
    const fetchBook = async () => {
      // Query single book by ID
      const { data, error } = await supabase
        .from('books') // Target table
        .select('*') // All columns
        .eq('id', id) // Match by book ID
        .single() // Expect exactly one result

      if (!error && data) {
        setBook(data) // Store book data
      }
      setLoading(false) // Hide spinner
    }
    fetchBook()
  }, [id]) // Re-fetch if ID changes

  // Loading spinner
  if (loading) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ width: 40, height: 40 }}></span>
      </div>
    )
  }

  // Book not found state
  if (!book) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <div className="empty-state-text">Book not found</div>
        <Link href="/admin" className="btn btn-secondary mt-2">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Back link to admin dashboard */}
      <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', marginBottom: '20px', fontSize: '0.9rem' }}>
        ← Back to Dashboard
      </Link>
      {/* Page header with book title */}
      <div className="page-header">
        <h1 className="page-title">Edit Book</h1>
        <p className="page-subtitle">Update the details for &quot;{book.title}&quot;</p>
      </div>
      {/* BookForm with `book` prop = edit mode (pre-fills all fields) */}
      <BookForm book={book} />
    </div>
  )
}
