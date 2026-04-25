'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CustomerRentalsPage() {
  const [requests, setRequests] = useState([])
  const [userReviews, setUserReviews] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Review Modal State
  const [reviewModalBook, setReviewModalBook] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('rent_requests')
        .select('*, books (id, title, author, cover_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch user's existing reviews to avoid showing the rate button if already reviewed
      const { data: reviewData } = await supabase
        .from('book_reviews')
        .select('book_id')
        .eq('user_id', user.id)

      setRequests(data || [])
      setUserReviews(reviewData?.map(r => r.book_id) || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const statusStyle = {
    pending: { bg: 'rgba(251, 191, 36, 0.12)', color: 'var(--yellow)', label: '⏳ Pending' },
    approved: { bg: 'var(--green-bg)', color: 'var(--green)', label: '✓ Approved' },
    rejected: { bg: 'var(--red-bg)', color: 'var(--red)', label: '✕ Rejected' },
    returned: { bg: 'rgba(201, 149, 108, 0.12)', color: 'var(--rose-gold)', label: '↩ Returned' },
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewModalBook) return
    setSubmittingReview(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error } = await supabase
        .from('book_reviews')
        .insert({
          book_id: reviewModalBook.id,
          user_id: user.id,
          rating: parseInt(reviewRating),
          review_text: reviewText.trim() || null
        })

      if (error) throw error
      
      setUserReviews([...userReviews, reviewModalBook.id])
      setReviewModalBook(null)
      setReviewText('')
      setReviewRating(5)
    } catch (err) {
      alert(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 className="page-title">My Rentals</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Track the status of your book rental requests.
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : requests.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't requested any books yet.</p>
          <Link href="/customer" className="btn btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map((req) => {
            const s = statusStyle[req.status] || statusStyle.pending
            return (
              <div key={req.id} style={{
                display: 'flex',
                gap: '14px',
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                alignItems: 'flex-start',
              }}>
                {req.books?.cover_url ? (
                  <Link href={`/customer/book/${req.books.id}`}>
                    <img src={req.books.cover_url} alt=""
                      style={{ width: '55px', height: '82px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  </Link>
                ) : (
                  <div style={{ width: '55px', height: '82px', backgroundColor: 'var(--brown-700)', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/customer/book/${req.books?.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.books?.title || 'Unknown'}
                    </h3>
                  </Link>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
                    by {req.books?.author || '?'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        backgroundColor: s.bg,
                        color: s.color,
                      }}>
                        {s.label}
                      </span>
                      {req.status === 'returned' && !userReviews.includes(req.books?.id) && (
                        <button 
                          className="btn btn-sm" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: 'rgba(201, 149, 108, 0.15)', color: 'var(--rose-gold)', border: '1px solid rgba(201, 149, 108, 0.3)' }}
                          onClick={() => setReviewModalBook(req.books)}
                        >
                          ⭐ Rate Book
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {req.status === 'approved' && req.due_date && (
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: new Date(req.due_date) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
                      📅 Return by: <strong>{new Date(req.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      {new Date(req.due_date) < new Date() && ' ⚠️ Overdue!'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalBook && (
        <div className="crop-modal" onClick={() => setReviewModalBook(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--brown-800)',
            border: '1px solid rgba(201, 149, 108, 0.15)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            width: 'calc(100vw - 32px)',
            maxWidth: '400px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h3 style={{ color: 'var(--gray-50)', marginBottom: '4px', fontSize: '1.1rem' }}>Rate "{reviewModalBook.title}"</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Hope you enjoyed reading this! Let others know what you think.
            </p>
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '8px' }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '1.8rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      onClick={() => setReviewRating(star)}
                      style={{ cursor: 'pointer', color: star <= reviewRating ? 'var(--yellow)' : 'var(--border-color)', transition: 'color 0.2s' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Review (optional)</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Share your thoughts on the book..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setReviewModalBook(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
