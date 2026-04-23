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

export default function BookCard({ book, basePath = '/customer/book', isWishlisted = false, onToggleWishlist = null }) {
  const coverUrl = book.cover_url || null
  const showNew = shouldShowNewBadge(book)

  return (
    <div className="card book-card" style={{ position: 'relative' }}>
      {/* Wishlist heart button — only shown if callback provided */}
      {onToggleWishlist && (
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(book.id); }}
          style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      )}

      {/* Clickable link wrapping the card content */}
      <Link href={`${basePath}/${book.id}`} style={{ display: 'block' }}>
        {/* Cover image */}
        <div className="book-card-cover">
          {coverUrl ? (
            <img src={coverUrl} alt={book.title} loading="lazy" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', opacity: 0.3 }}>
              📖
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
