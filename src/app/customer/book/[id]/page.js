'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function BookDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [renting, setRenting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchBook = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setBook(data)
      }
      setLoading(false)
    }
    fetchBook()
  }, [id])

  const handleRent = async () => {
    setRenting(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Mark as out of stock
      const { error } = await supabase
        .from('books')
        .update({ available: false })
        .eq('id', book.id)

      if (error) throw error

      setBook({ ...book, available: false })
      setMessage('Redirecting to WhatsApp... 🎉')

      // Open WhatsApp chat
      const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '' // e.g., '919876543210'
      if (!phoneNumber) {
        console.warn('NEXT_PUBLIC_WHATSAPP_NUMBER is not set in .env.local')
      }
      
      const text = encodeURIComponent(`Hello! I would like to rent the book: *${book.title}* by ${book.author}.`)
      window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank')

    } catch (err) {
      setMessage(err.message || 'Failed to rent book')
    } finally {
      setRenting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ width: 40, height: 40 }}></span>
      </div>
    )
  }

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
      <Link href="/customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', marginBottom: '20px', fontSize: '0.9rem' }}>
        ← Back to Catalog
      </Link>

      <div className="book-detail">
        <div className="book-detail-cover">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: 0.3 }}>
              📖
            </div>
          )}
        </div>

        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <div className="book-detail-author">by {book.author}</div>

          <div className="book-detail-meta">
            <span className="badge badge-genre">{book.genre}</span>
            <span className="badge badge-genre">{book.language}</span>
          </div>

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

          {message && (
            <div className={message.includes('success') ? 'auth-error' : 'auth-error'} style={{
              background: message.includes('success') ? 'var(--green-bg)' : 'var(--red-bg)',
              color: message.includes('success') ? 'var(--green)' : 'var(--red)',
              borderColor: message.includes('success') ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)',
              marginBottom: '16px',
            }}>
              {message}
            </div>
          )}

          {book.available && (
            <button
              onClick={handleRent}
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
