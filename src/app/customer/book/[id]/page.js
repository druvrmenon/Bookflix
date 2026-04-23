// Book detail page — shows full book info with rent button
// Customer clicks "Rent This Book" → opens WhatsApp chat with pre-filled message
'use client' // Client component — handles user interaction and data fetching

import { useState, useEffect } from 'react' // React hooks
import { useParams } from 'next/navigation' // Get dynamic route param [id]
import Link from 'next/link' // Next.js optimized link
import { createClient } from '@/lib/supabase/client' // Browser Supabase client

export default function BookDetailPage() {
  const { id } = useParams() // Get book ID from URL (e.g., /customer/book/abc-123)
  const supabase = createClient() // Supabase client
  const [book, setBook] = useState(null) // Book data
  const [loading, setLoading] = useState(true) // Loading state
  const [renting, setRenting] = useState(false) // Rent button loading
  const [message, setMessage] = useState('') // Success/error message

  // Fetch book data on mount or when ID changes
  useEffect(() => {
    const fetchBook = async () => {
      // Query single book by ID
      const { data, error } = await supabase
        .from('books') // Target table
        .select('*') // All columns
        .eq('id', id) // Match by book ID
        .single() // Expect exactly one result

      // Store book if found
      if (!error && data) {
        setBook(data)
      }
      setLoading(false) // Hide spinner
    }
    fetchBook()
  }, [id]) // Re-fetch if ID changes

  // Rent button handler — opens WhatsApp chat with pre-filled message
  // Does NOT change book availability (only admins can do that)
  const handleRent = async () => {
    setRenting(true) // Show button spinner
    setMessage('') // Clear previous messages

    try {
      setMessage('Redirecting to WhatsApp... 🎉') // Show success

      // Get WhatsApp number from environment variable
      // Format: country code + number, no spaces/dashes (e.g., 919876543210)
      const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
      if (!phoneNumber) {
        console.warn('NEXT_PUBLIC_WHATSAPP_NUMBER is not set in .env.local')
      }

      // Build WhatsApp message with book title and author
      const text = encodeURIComponent(`Hello! I would like to rent the book: *${book.title}* by ${book.author}.`)
      // Open WhatsApp in new tab using the wa.me universal link
      window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank')

    } catch (err) {
      setMessage(err.message || 'Failed to rent book') // Show error
    } finally {
      setRenting(false) // Hide button spinner
    }
  }

  // Loading spinner while fetching book data
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
        <Link href="/customer" className="btn btn-secondary mt-2">Back to Catalog</Link>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Back link to catalog */}
      <Link href="/customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', marginBottom: '20px', fontSize: '0.9rem' }}>
        ← Back to Catalog
      </Link>

      {/* Book detail layout — cover + info side by side on desktop */}
      <div className="book-detail">
        {/* Cover image */}
        <div className="book-detail-cover">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} />
          ) : (
            // Placeholder when no cover image
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: 0.3 }}>
              📖
            </div>
          )}
        </div>

        {/* Book info section */}
        <div className="book-detail-info">
          {/* Title */}
          <h1>{book.title}</h1>
          {/* Author */}
          <div className="book-detail-author">by {book.author}</div>

          {/* Genre and language badges */}
          <div className="book-detail-meta">
            {/* Handle both array and string genre formats */}
            {Array.isArray(book.genre) ? (
              book.genre.map(g => (
                <span key={g} className="badge badge-genre">{g}</span>
              ))
            ) : (
              <span className="badge badge-genre">{book.genre}</span>
            )}
            {/* Language badge with distinct styling */}
            <span className="badge badge-genre" style={{ background: 'var(--text-muted)' }}>{book.language}</span>
          </div>

          {/* Availability status indicator */}
          <div className={`book-detail-availability ${book.available ? 'in-stock' : 'out-of-stock'}`}>
            {book.available ? (
              '✓ Available for Rent'
            ) : (
              <>
                ✕ Currently Out of Stock
                {/* Show expected availability date if set by admin */}
                {book.available_date && (
                  <div className="book-detail-date">
                    Expected back: {new Date(book.available_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Success/error message banner */}
          {message && (
            <div className={message.includes('success') ? 'auth-error' : 'auth-error'} style={{
              background: message.includes('success') || message.includes('WhatsApp') ? 'var(--green-bg)' : 'var(--red-bg)',
              color: message.includes('success') || message.includes('WhatsApp') ? 'var(--green)' : 'var(--red)',
              borderColor: message.includes('success') || message.includes('WhatsApp') ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)',
              marginBottom: '16px',
            }}>
              {message}
            </div>
          )}

          {/* Rent button — only shown when book is available */}
          {book.available && (
            <button
              onClick={handleRent} // Open WhatsApp chat
              className="btn btn-primary"
              disabled={renting}
              style={{ width: '100%', maxWidth: '300px' }}
            >
              {renting && <span className="spinner"></span>}
              Rent This Book
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
