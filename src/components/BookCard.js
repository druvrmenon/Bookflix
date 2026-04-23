// BookCard component — displays a single book in the catalog grid
// Shows cover, title, author, genres, availability, "NEW" badge, and wishlist heart
'use client'

import Link from 'next/link'

// Helper: check if book should show "NEW" badge
// show_new_badge: null = auto (< 7 days), true = force on, false = force off
function shouldShowNewBadge(book) {
  if (book.show_new_badge === true) return true
  if (book.show_new_badge === false) return false
  // Auto: show if created within last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return new Date(book.created_at) > sevenDaysAgo
}

export default function BookCard({ book, basePath = '/customer/book' }) {
  const coverUrl = book.cover_url || null
  const showNew = shouldShowNewBadge(book)

  return (
    <div className="card book-card" style={{ position: 'relative' }}>
      {/* Clickable link wrapping the card content */}
      <Link href={`${basePath}/${book.id}`} style={{ display: 'block' }}>
        {/* Cover image */}
        <div className="book-card-cover">
          {coverUrl ? (
            <img src={coverUrl} alt={book.title} loading="lazy" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          )}
          {/* Status + NEW badges */}
          <div className="book-card-status">
            {showNew && <span className="badge-new">NEW</span>}
            {' '}
            <span className={`badge ${book.available ? 'badge-available' : 'badge-unavailable'}`}>
              {book.available ? 'Available' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="book-card-body">
          <div className="book-card-title">{book.title}</div>
          <div className="book-card-author">by {book.author}</div>
          <div className="book-card-meta">
            {Array.isArray(book.genre) ? (
              book.genre.map(g => (
                <span key={g} className="badge badge-genre" style={{ marginRight: '4px' }}>{g}</span>
              ))
            ) : (
              <span className="badge badge-genre">{book.genre}</span>
            )}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{book.language}</span>
          </div>
          {!book.available && book.available_date && (
            <div style={{ fontSize: '0.78rem', color: 'var(--yellow)', marginTop: '6px' }}>
              Available from: {new Date(book.available_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
