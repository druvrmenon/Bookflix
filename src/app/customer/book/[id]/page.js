// Book detail page — full book info with front/back cover, description, and WhatsApp rent
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BookLoading from '@/components/BookLoading'

export default function BookDetailPage() {
  const { id } = useParams()
  const supabase = createClient()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [renting, setRenting] = useState(false)
  const [message, setMessage] = useState('')
  const [showBack, setShowBack] = useState(false) // Toggle front/back cover

  useEffect(() => {
    const fetchBook = async () => {
      const { data, error } = await supabase
        .from('books').select('*').eq('id', id).single()
      if (!error && data) setBook(data)
      setLoading(false)
    }
    fetchBook()
  }, [id])

  // WhatsApp rent handler
  const handleRent = async () => {
    setRenting(true)
    setMessage('')
    try {
      setMessage('Redirecting to WhatsApp...')
      const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
      const text = encodeURIComponent(`Hello! I would like to rent the book: *${book.title}* by ${book.author}.`)
      window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank')
    } catch (err) {
      setMessage(err.message || 'Failed to rent book')
    } finally {
      setRenting(false)
    }
  }

  if (loading) return <BookLoading text="Loading book details..." />

  if (!book) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <div className="empty-state-text">Book not found</div>
        <Link href="/customer" className="btn btn-secondary mt-2">Back to Catalog</Link>
      </div>
    )
  }

  // Determine which cover to show
  const currentCover = showBack && book.back_cover_url ? book.back_cover_url : book.cover_url

  return (
    <div className="fade-in">
      <Link href="/customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', marginBottom: '20px', fontSize: '0.9rem' }}>
        ← Back to Catalog
      </Link>

      <div className="book-detail">
        {/* Cover section */}
        <div>
          <div className="book-detail-cover">
            {currentCover ? (
              <img src={currentCover} alt={showBack ? 'Back cover' : book.title} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
            )}
          </div>
          {/* Front/Back toggle — only show if back cover exists */}
          {book.back_cover_url && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
              <button
                className={`btn btn-sm ${!showBack ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowBack(false)}
              >
                Front
              </button>
              <button
                className={`btn btn-sm ${showBack ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowBack(true)}
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Book info */}
        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <div className="book-detail-author">by {book.author}</div>

          {/* Genre and language badges */}
          <div className="book-detail-meta">
            {Array.isArray(book.genre) ? (
              book.genre.map(g => (<span key={g} className="badge badge-genre">{g}</span>))
            ) : (
              <span className="badge badge-genre">{book.genre}</span>
            )}
            <span className="badge badge-genre" style={{ background: 'var(--text-muted)' }}>{book.language}</span>
          </div>

          {/* Description */}
          {book.description && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginTop: '16px', marginBottom: '16px' }}>
              {book.description}
            </div>
          )}

          {/* Availability */}
          <div className={`book-detail-availability ${book.available ? 'in-stock' : 'out-of-stock'}`}>
            {book.available ? (
              '✓ Available for Rent'
            ) : (
              <>
                ✕ Currently Out of Stock
                {book.available_date && (
                  <div className="book-detail-date">
                    Expected back: {new Date(book.available_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Message banner */}
          {message && (
            <div className="auth-error" style={{
              background: message.includes('WhatsApp') ? 'var(--green-bg)' : 'var(--red-bg)',
              color: message.includes('WhatsApp') ? 'var(--green)' : 'var(--red)',
              borderColor: message.includes('WhatsApp') ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)',
              marginBottom: '16px',
            }}>
              {message}
            </div>
          )}

          {/* Rent button */}
          {book.available && (
            <button onClick={handleRent} className="btn btn-primary" disabled={renting}
              style={{ width: '100%', maxWidth: '300px' }}>
              {renting && <span className="spinner"></span>}
              Rent This Book
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
