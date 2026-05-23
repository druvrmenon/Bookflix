'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import BookLoading from '@/components/BookLoading'
import Portal from '@/components/Portal'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>Loading Map...</div>
})

export default function BookDetailClient({ initialBook, id }) {
  const supabase = createClient()
  const [book, setBook] = useState(initialBook)
  const [loading, setLoading] = useState(!initialBook)
  const [renting, setRenting] = useState(false)
  const [message, setMessage] = useState('')
  const [showBack, setShowBack] = useState(false)
  const [sharingStory, setSharingStory] = useState(false)

  // Rent request modal
  const [rentModal, setRentModal] = useState(false)
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [agreeFees, setAgreeFees] = useState(false)
  const [agreeDamage, setAgreeDamage] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [screenshotFile, setScreenshotFile] = useState(null)

  // Queue state for out-of-stock books
  const [queueCount, setQueueCount] = useState(0)
  const [alreadyInQueue, setAlreadyInQueue] = useState(false)

  // Reviews
  const [reviews, setReviews] = useState([])
  const [userReview, setUserReview] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    const fetchFullData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // If we didn't have initialBook (fallback), fetch it
      if (!book) {
        const { data, error } = await supabase
          .from('books').select('*').eq('id', id).single()
        if (!error && data) setBook(data)
      }

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('book_reviews')
        .select('*, profiles(full_name)')
        .eq('book_id', id)
        .order('created_at', { ascending: false })

      if (reviewsData) {
        setReviews(reviewsData)
        if (user) {
          const myReview = reviewsData.find(r => r.user_id === user.id)
          if (myReview) setUserReview(myReview)

          // Check if user has returned the book
          const { data: rentData } = await supabase
            .from('rent_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('book_id', id)
            .eq('status', 'returned')
            .limit(1)

          if (rentData && rentData.length > 0) {
            setCanReview(true)
          }
        }
      }

      // Fetch pending queue count for this book
      const { count } = await supabase
        .from('rent_requests')
        .select('id', { count: 'exact', head: true })
        .eq('book_id', id)
        .eq('status', 'pending')
      setQueueCount(count || 0)

      // Check if the current user already has a pending request for this book
      if (user) {
        const { data: myPending } = await supabase
          .from('rent_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('book_id', id)
          .eq('status', 'pending')
          .limit(1)
        setAlreadyInQueue(myPending && myPending.length > 0)
      }

      setLoading(false)
    }
    fetchFullData()
  }, [id, supabase, book])

  const openRentModal = () => {
    setMessage('')
    setContactName('')
    setPhone('')
    setAddress('')
    setAgreeFees(false)
    setAgreeDamage(false)
    setAgreeTerms(false)
    setLat(null)
    setLng(null)
    setShowMap(false)
    setPaymentMethod('cash')
    setScreenshotFile(null)
    setRentModal(true)
  }

  const submitRentRequest = async (e) => {
    e.preventDefault()
    if (!contactName.trim() || !phone.trim()) return
    
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number.')
      return
    }

    if (!lat || !lng) {
      alert('Please pin your exact drop location on the map.')
      setShowMap(true)
      return
    }

    if (!agreeFees || !agreeDamage || !agreeTerms) {
      alert('Please agree to all terms before requesting.')
      return
    }

    if (paymentMethod === 'upi' && !screenshotFile) {
      alert('Please upload your payment screenshot.')
      return
    }

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
        setRentModal(false)
        return
      }

      let screenshotUrl = null
      if (paymentMethod === 'upi' && screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `payments/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(filePath, screenshotFile)
        
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('book-covers')
          .getPublicUrl(filePath)
          
        screenshotUrl = publicUrl
      }

      const { error: insertErr } = await supabase
        .from('rent_requests')
        .insert({
          user_id: user.id,
          book_id: id,
          contact_name: contactName.trim(),
          phone: phone.trim(),
          address: address.trim() || null,
          latitude: lat,
          longitude: lng,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'upi' ? 'submitted' : 'unpaid',
          payment_screenshot_url: screenshotUrl
        })

      if (insertErr) throw insertErr
      setRentModal(false)
      if (!book.available) {
        setAlreadyInQueue(true)
        setQueueCount(c => c + 1)
        setMessage("You've joined the queue! We'll let you know when it's your turn.")
      } else {
        setMessage('Rent request sent! The owner will get back to you.')
      }
    } catch (err) {
      setMessage(err.message || 'Failed to send request')
    } finally {
      setRenting(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { data, error } = await supabase
        .from('book_reviews')
        .insert({
          book_id: id,
          user_id: user.id,
          rating: parseInt(reviewRating),
          review_text: reviewText.trim() || null
        })
        .select('*, profiles(full_name)')
        .single()

      if (error) throw error

      setReviews([data, ...reviews])
      setUserReview(data)
      setReviewText('')
      setReviewRating(5)
    } catch (err) {
      alert(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleShareStory = async () => {
    setSharingStory(true)
    setMessage('')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')

      const loadImg = (src) => new Promise((resolve, reject) => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })

      // 1. Background
      ctx.fillStyle = '#1a120c'
      ctx.fillRect(0, 0, 1080, 1920)

      if (book.cover_url) {
        try {
          const bgImg = await loadImg(book.cover_url)
          
          // Draw blurred background
          ctx.save()
          // Scale image to cover
          const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height)
          const x = (canvas.width / 2) - (bgImg.width / 2) * scale
          const y = (canvas.height / 2) - (bgImg.height / 2) * scale
          
          ctx.filter = 'blur(60px) brightness(0.4)'
          ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale)
          ctx.restore()
          
          // Dark overlay gradient
          const grad = ctx.createLinearGradient(0, 0, 0, 1920)
          grad.addColorStop(0, 'rgba(26, 18, 12, 0.3)')
          grad.addColorStop(0.5, 'rgba(26, 18, 12, 0.1)')
          grad.addColorStop(1, 'rgba(26, 18, 12, 0.8)')
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, 1080, 1920)
        } catch (e) {
          console.error("Failed to load background image", e)
        }
      }

      // 2. Header Text
      ctx.fillStyle = '#c9956c'
      ctx.font = '500 42px sans-serif'
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText("AVAILABLE TO RENT", 540, 220)
      
      // 3. Book Cover
      if (book.cover_url) {
        const coverImg = await loadImg(book.cover_url)
        const coverWidth = 680
        const coverHeight = 1020
        const coverX = (1080 - coverWidth) / 2
        const coverY = 320 

        // Multi-layered soft shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
        ctx.shadowBlur = 80
        ctx.shadowOffsetY = 40
        ctx.drawImage(coverImg, coverX, coverY, coverWidth, coverHeight)
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetY = 10
        ctx.drawImage(coverImg, coverX, coverY, coverWidth, coverHeight)
        
        ctx.shadowColor = 'transparent'
        
        // Thin accent border
        ctx.strokeStyle = 'rgba(201, 149, 108, 0.3)'
        ctx.lineWidth = 2
        ctx.strokeRect(coverX, coverY, coverWidth, coverHeight)
      }

      // 4. Book Info
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 85px sans-serif'
      const safeTitle = book.title.length > 22 ? book.title.substring(0, 19) + '...' : book.title
      ctx.fillText(safeTitle, 540, 1450)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '400 48px sans-serif'
      ctx.fillText(`by ${book.author}`, 540, 1530)

      // 5. Footer / Branding
      try {
        const logoImg = await loadImg(window.location.origin + '/logo.png')
        const logoHeight = 130
        const logoWidth = logoImg.width * (logoHeight / logoImg.height)
        ctx.globalAlpha = 0.9
        ctx.drawImage(logoImg, (1080 - logoWidth) / 2, 1660, logoWidth, logoHeight)
        ctx.globalAlpha = 1.0
        
        ctx.fillStyle = '#c9956c'
        ctx.font = '500 36px sans-serif'
        ctx.letterSpacing = '1px'
        ctx.fillText('WWW.BOOKFLIX.IN', 540, 1840)
      } catch (e) {
        console.error("Failed to load logo", e)
      }

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], 'bookflix-story.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: book.title,
          text: `Check out "${book.title}" on BookFlix!`,
          url: window.location.href,
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
    } catch (shareError) {
      console.error(shareError)
      setMessage('Failed to generate story image.')
    } finally {
      setSharingStory(false)
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
        <div>
          <div className="book-detail-cover" style={{ position: 'relative' }}>
            {currentCover ? (
              <Image
                src={currentCover}
                alt={showBack ? 'Back cover' : book.title}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 300px"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
            )}
          </div>
          {book.back_cover_url && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
              <button className={`btn btn-sm ${!showBack ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowBack(false)}>Front</button>
              <button className={`btn btn-sm ${showBack ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowBack(true)}>Back</button>
            </div>
          )}
        </div>

        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <div className="book-detail-author">by {book.author}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--yellow)', fontSize: '1.2rem' }}>★</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>
              {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'New'}
            </span>
            <span style={{ fontSize: '0.85rem' }}>({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>

          <div className="book-detail-meta">
            {Array.isArray(book.genre) ? (
              book.genre.map(g => (<span key={g} className="badge badge-genre">{g}</span>))
            ) : (
              <span className="badge badge-genre">{book.genre}</span>
            )}
            <span className="badge badge-genre" style={{ background: 'var(--text-muted)' }}>{book.language}</span>
          </div>

          {book.description && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginTop: '16px', marginBottom: '16px' }}>
              {book.description}
            </div>
          )}

          <div className={`book-detail-availability ${book.available ? 'in-stock' : 'out-of-stock'}`}>
            {book.available ? '✓ Available for Rent' : (
              <>
                ✕ Currently Out of Stock
                {book.available_date && (
                  <div className="book-detail-date">
                    Expected back: {new Date(book.available_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {/* Queue size indicator */}
                {queueCount > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    🧑‍🤝‍🧑 {queueCount} {queueCount === 1 ? 'person' : 'people'} waiting in queue
                  </div>
                )}
              </>
            )}
          </div>

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
            {book.available ? (
              <button onClick={openRentModal} className="btn btn-primary" disabled={renting} style={{ width: '100%', maxWidth: '300px' }}>
                Request to Rent
              </button>
            ) : (
              alreadyInQueue ? (
                <div style={{
                  width: '100%', maxWidth: '300px',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius)',
                  background: 'rgba(74, 222, 128, 0.08)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                  color: 'var(--green)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  🔔 You're in the queue
                </div>
              ) : (
                <button onClick={openRentModal} className="btn btn-secondary" disabled={renting} style={{
                  width: '100%', maxWidth: '300px',
                  border: '1px solid rgba(201, 149, 108, 0.4)',
                  color: 'var(--rose-gold)',
                }}>
                  🔔 Join Queue
                </button>
              )
            )}

            <button onClick={handleShareStory} className="btn" disabled={sharingStory} style={{
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
              {sharingStory ? <span className="spinner"></span> : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              )}
              Share to IG Story
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Reviews</h2>

        {!userReview ? (
          canReview ? (
            <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--bg-secondary)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Leave a Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} onClick={() => setReviewRating(star)}
                        style={{ cursor: 'pointer', color: star <= reviewRating ? 'var(--yellow)' : 'var(--border-color)' }}>★</span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Review (optional)</label>
                  <textarea className="form-input" rows="3" placeholder="What did you think of this book?" value={reviewText} onChange={e => setReviewText(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--bg-secondary)', textAlign: 'center', padding: '16px' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>You can review this book after you have rented and returned it.</p>
            </div>
          )
        ) : (
          <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>Your Review</strong>
              <div style={{ color: 'var(--yellow)' }}>{'★'.repeat(userReview.rating)}{'☆'.repeat(5 - userReview.rating)}</div>
            </div>
            {userReview.review_text && <p style={{ color: 'var(--text-muted)', margin: 0 }}>{userReview.review_text}</p>}
          </div>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No reviews yet. Be the first to review!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map(review => {
              if (userReview && review.id === userReview.id) return null
              return (
                <div key={review.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{review.profiles?.full_name || 'Anonymous'}</strong>
                    <div style={{ color: 'var(--yellow)' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  </div>
                  {review.review_text && <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{review.review_text}</p>}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '8px' }}>{new Date(review.created_at).toLocaleDateString()}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {rentModal && (
        <Portal>
          <div className="crop-modal" onClick={() => setRentModal(false)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'var(--brown-800)',
              border: '1px solid rgba(201, 149, 108, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              width: 'calc(100vw - 32px)',
              maxWidth: '400px',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <h3 style={{ color: 'var(--gray-50)', marginBottom: '4px', fontSize: '1.1rem' }}>
                {book.available ? 'Request to Rent' : 'Join the Queue'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {book.available
                  ? 'Enter your details so the owner can reach you.'
                  : "We'll notify you when the book is available and approve in queue order."}
              </p>
              <form onSubmit={submitRentRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="rent-name">Your Name *</label>
                  <input id="rent-name" className="form-input" type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Full name" required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="rent-phone">Phone Number *</label>
                  <input 
                    id="rent-phone" 
                    className="form-input" 
                    type="tel" 
                    value={phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '') // Remove non-digits
                      if (val.length <= 10) setPhone(val)
                    }} 
                    placeholder="e.g. 9876543210" 
                    required 
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="rent-addr">Full Address *</label>
                  <textarea id="rent-addr" className="form-input" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address" required style={{ resize: 'vertical' }} />
                </div>

                <div style={{ margin: '4px 0' }}>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-secondary" 
                    style={{ width: '100%', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: !lat ? '1px dashed var(--rose-gold)' : undefined }}
                    onClick={() => setShowMap(!showMap)}
                  >
                    📍 {showMap ? 'Hide Map' : (lat ? 'Location Set ✓' : 'Pin Location on Map *')}
                  </button>
                  {showMap && (
                    <MapPicker onLocationSelect={(lat, lng) => {
                      setLat(lat)
                      setLng(lng)
                    }} />
                  )}
                </div>

                <div className="form-group" style={{ margin: '4px 0' }}>
                  <label className="form-label">Payment Method *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className={`btn btn-sm ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setPaymentMethod('cash')}>Cash on Delivery</button>
                    <button type="button" className={`btn btn-sm ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setPaymentMethod('upi')}>UPI (₹70)</button>
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <div style={{ padding: '16px', background: 'rgba(201, 149, 108, 0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(201, 149, 108, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gray-50)', textAlign: 'center' }}>
                      Pay <strong>₹70</strong> (2 weeks advance) to:
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--rose-gold)', textAlign: 'center', letterSpacing: '1px' }}>
                      {process.env.NEXT_PUBLIC_UPI_ID || 'admin@upi'}
                    </div>
                    <a href={`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'admin@upi'}&am=70&tn=BookFlix_Rental`} className="btn btn-sm btn-primary" style={{ display: 'flex', justifyContent: 'center' }}>
                      Pay via UPI App
                    </a>
                    
                    <div style={{ marginTop: '8px' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Upload Screenshot *</label>
                      <input type="file" accept="image/*" onChange={e => setScreenshotFile(e.target.files[0])} className="form-input" style={{ padding: '8px', fontSize: '0.85rem' }} required={paymentMethod === 'upi'} />
                      {screenshotFile && <div style={{ fontSize: '0.8rem', color: 'var(--green)', marginTop: '4px' }}>Screenshot attached ✓</div>}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreeFees} onChange={e => setAgreeFees(e.target.checked)} required />
                    <span>I agree to pay for 2 weeks in advance (70 rupees).</span>
                  </label>
                  <label style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreeDamage} onChange={e => setAgreeDamage(e.target.checked)} required />
                    <span>I agree to pay ₹600 if the book is damaged or lost.</span>
                  </label>
                  <label style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} required />
                    <span>I agree to the <Link href="/terms" target="_blank" style={{ color: 'var(--rose-gold)', textDecoration: 'underline' }}>Terms and Conditions</Link>.</span>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRentModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={renting || !agreeFees || !agreeDamage || !agreeTerms}>
                    {renting ? '...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
