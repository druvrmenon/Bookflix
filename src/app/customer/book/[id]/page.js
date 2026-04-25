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
  const [showBack, setShowBack] = useState(false)
  const [sharingThisShit, setSharingThisShit] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      const { data: fuckingData, error: shitError } = await supabase
        .from('books').select('*').eq('id', id).single()
      if (!shitError && fuckingData) setBook(fuckingData)
      setLoading(false)
    }
    fetchBook()
  }, [id])

  const handleRent = async () => {
    setRenting(true)
    setMessage('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error: existCheck } = await supabase
        .from('rent_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', id)
        .eq('status', 'pending')
        .single()

      if (!existCheck) {
        setMessage('You already have a pending request for this book.')
        return
      }

      const { error: insertErr } = await supabase
        .from('rent_requests')
        .insert({ user_id: user.id, book_id: id })

      if (insertErr) throw insertErr
      setMessage('Rent request sent! The owner will get back to you.')
    } catch (err) {
      setMessage(err.message || 'Failed to send request')
    } finally {
      setRenting(false)
    }
  }

  const handleShareStory = async () => {
    setSharingThisShit(true)
    setMessage('')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#1a120c'
      ctx.fillRect(0, 0, 1080, 1920)

      ctx.fillStyle = '#c9956c'
      ctx.font = 'bold 50px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText("Available to rent on BookFlix!", 540, 250)

      const loadImg = (src) => new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })

      if (book.cover_url) {
        const coverImg = await loadImg(book.cover_url)
        const coverWidth = 700
        const coverHeight = 1050
        const coverX = (1080 - coverWidth) / 2
        const coverY = 290 // Moved up slightly
        
        // Add drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
        ctx.shadowBlur = 50
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 20
        
        ctx.drawImage(coverImg, coverX, coverY, coverWidth, coverHeight)
        
        // Reset shadow
        ctx.shadowColor = 'transparent'
      }

      ctx.fillStyle = '#f9fafb'
      ctx.font = 'bold 80px sans-serif'
      const safeTitle = book.title.length > 25 ? book.title.substring(0, 22) + '...' : book.title
      ctx.fillText(safeTitle, 540, 1450)

      ctx.fillStyle = '#a8a29e'
      ctx.font = '45px sans-serif'
      ctx.fillText(`by ${book.author}`, 540, 1530)



      try {
        const logoImg = await loadImg(window.location.origin + '/logo.png')
        const logoHeight = 160
        const logoWidth = logoImg.width * (logoHeight / logoImg.height)
        ctx.drawImage(logoImg, (1080 - logoWidth) / 2, 1620, logoWidth, logoHeight)
      } catch (e) {
        console.error("Failed to load logo", e)
      }

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], 'bookflix-story.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: book.title,
          text: `Reading ${book.title} on BookFlix!`,
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `story-${book.title.replace(/\s+/g, '-').toLowerCase()}.png`
        a.click()
        URL.revokeObjectURL(url)
        setMessage('Story graphic downloaded! You can now upload it to Instagram.')
      }
    } catch (fuckinError) {
      console.error(fuckinError)
      setMessage('Failed to generate story image.')
    } finally {
      setSharingThisShit(false)
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
              background: message.includes('sent') ? 'var(--green-bg)' : message.includes('pending') ? 'rgba(251, 191, 36, 0.1)' : 'var(--red-bg)',
              color: message.includes('sent') ? 'var(--green)' : message.includes('pending') ? 'var(--yellow)' : 'var(--red)',
              borderColor: message.includes('sent') ? 'rgba(74,222,128,0.3)' : message.includes('pending') ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)',
              marginBottom: '16px',
            }}>
              {message}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
            {/* Rent button */}
            {book.available && (
              <button onClick={handleRent} className="btn btn-primary" disabled={renting}
                style={{ width: '100%', maxWidth: '300px' }}>
                {renting && <span className="spinner"></span>}
                Request to Rent
              </button>
            )}

            {/* Share to IG Story button */}
            <button onClick={handleShareStory} className="btn" disabled={sharingThisShit}
              style={{ 
                width: '100%', 
                maxWidth: '300px', 
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
                color: 'white', 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px' 
              }}>
              {sharingThisShit ? <span className="spinner"></span> : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              )}
              Share to IG Story
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
