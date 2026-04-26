// Customer catalog page — browse all books with search, filters, sort, and wishlist
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import BookLoading from '@/components/BookLoading'

export default function CatalogPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [language, setLanguage] = useState('')
  const [sortBy, setSortBy] = useState('newest') // Sort option
  const supabase = createClient()

  // Auto-review modal state
  const [autoReviewModalBook, setAutoReviewModalBook] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Fetch books on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch all books
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (booksData) setBooks(booksData)
      
      // Check for unreviewed returned books
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Limit to checking only the 5 most recent returns to fix data overfetching
        const { data: rentData } = await supabase
          .from('rent_requests')
          .select('book_id, books (id, title)')
          .eq('user_id', user.id)
          .eq('status', 'returned')
          .order('created_at', { ascending: false })
          .limit(5)
          
        if (rentData && rentData.length > 0) {
          const bookIdsToCheck = rentData.map(r => r.book_id)
          
          // Only fetch reviews for these specific 5 books
          const { data: reviewData } = await supabase
            .from('book_reviews')
            .select('book_id')
            .eq('user_id', user.id)
            .in('book_id', bookIdsToCheck)
            
          const reviewedBookIds = reviewData?.map(r => r.book_id) || []
          
          // Check local storage for dismissed/skipped reviews to fix the "infinite nag"
          let skippedBookIds = []
          try {
            skippedBookIds = JSON.parse(localStorage.getItem('skipped_reviews') || '[]')
          } catch (e) {}

          const unreviewedRentals = rentData.filter(r => 
            !reviewedBookIds.includes(r.book_id) && !skippedBookIds.includes(r.book_id)
          )
          
          // If they have unreviewed books that they haven't skipped, pop up the first one
          if (unreviewedRentals.length > 0 && unreviewedRentals[0].books) {
            setAutoReviewModalBook(unreviewedRentals[0].books)
          }
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  // Filter and sort books — recalculates when any filter/sort changes
  const filtered = useMemo(() => {
    let result = books.filter((book) => {
      const matchSearch = search === '' ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      const matchGenre = genre === '' || (Array.isArray(book.genre) ? book.genre.includes(genre) : book.genre === genre)
      const matchLang = language === '' || book.language === language
      return matchSearch && matchGenre && matchLang
    })

    // Sort
    switch (sortBy) {
      case 'title-az':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title-za':
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'author':
        result.sort((a, b) => a.author.localeCompare(b.author))
        break
      case 'available':
        result.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0))
        break
      case 'newest':
      default:
        // Already sorted by newest from query
        break
    }

    return result
  }, [books, search, genre, language, sortBy])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!autoReviewModalBook) return
    setSubmittingReview(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error } = await supabase
        .from('book_reviews')
        .insert({
          book_id: autoReviewModalBook.id,
          user_id: user.id,
          rating: parseInt(reviewRating),
          review_text: reviewText.trim() || null
        })

      if (error) throw error
      
      setAutoReviewModalBook(null)
      setReviewText('')
      setReviewRating(5)
    } catch (err) {
      alert(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleSkipReview = () => {
    if (!autoReviewModalBook) return
    
    try {
      const skippedBookIds = JSON.parse(localStorage.getItem('skipped_reviews') || '[]')
      if (!skippedBookIds.includes(autoReviewModalBook.id)) {
        skippedBookIds.push(autoReviewModalBook.id)
        localStorage.setItem('skipped_reviews', JSON.stringify(skippedBookIds))
      }
    } catch (e) {
      console.error('Failed to save skipped review to local storage', e)
    }
    
    setAutoReviewModalBook(null)
  }

  if (loading) return <BookLoading text="Loading catalog..." />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Book Catalog</h1>
        <p className="page-subtitle">Discover your next great read</p>
      </div>

      {/* Search + Sort row */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <SearchBar value={search} onChange={setSearch} />
        </div>
        {/* Sort dropdown */}
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="title-az">Title A→Z</option>
          <option value="title-za">Title Z→A</option>
          <option value="author">Author</option>
          <option value="available">Available First</option>
        </select>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '28px' }}>
        <FilterBar
          selectedGenre={genre} onGenreChange={setGenre}
          selectedLanguage={language} onLanguageChange={setLanguage}
        />
      </div>

      {/* Book grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div className="empty-state-text">
            {search || genre || language
              ? 'No books match your filters.'
              : 'No books available yet.'}
          </div>
        </div>
      ) : (
        <div className="book-grid">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
            />
          ))}
        </div>
      )}

      {/* Auto-Review Modal */}
      {autoReviewModalBook && (
        <div className="crop-modal" onClick={() => setAutoReviewModalBook(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--brown-800)',
            border: '1px solid rgba(201, 149, 108, 0.15)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            width: 'calc(100vw - 32px)',
            maxWidth: '400px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h3 style={{ color: 'var(--gray-50)', marginBottom: '4px', fontSize: '1.1rem' }}>How was "{autoReviewModalBook.title}"?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              You recently returned this book. Take a moment to rate it!
            </p>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  onClick={handleSkipReview}>Skip for now</button>
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
