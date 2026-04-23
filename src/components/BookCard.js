// BookCard component — displays a single book in the catalog grid
// Shows cover image, title, author, genre badges, availability status
'use client' // Client component for Link interactivity

import Link from 'next/link' // Next.js optimized link with prefetching

// BookCard accepts a `book` object and optional `basePath` for the detail link
export default function BookCard({ book, basePath = '/customer/book' }) {
  // Get cover image URL (null if no cover uploaded)
  const coverUrl = book.cover_url || null

  return (
    // Entire card is a link to the book detail page
    <Link href={`${basePath}/${book.id}`} className="card book-card">
      {/* Cover image section with 2:3 aspect ratio */}
      <div className="book-card-cover">
        {coverUrl ? (
          // Show book cover image with lazy loading for performance
          <img src={coverUrl} alt={book.title} loading="lazy" />
        ) : (
          // Fallback placeholder when no cover is uploaded
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            opacity: 0.3
          }}>
            📖
          </div>
        )}
        {/* Availability badge — positioned over the cover image */}
        <div className="book-card-status">
          <span className={`badge ${book.available ? 'badge-available' : 'badge-unavailable'}`}>
            {book.available ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Card body — book info below the cover */}
      <div className="book-card-body">
        {/* Book title — truncated to 2 lines via CSS */}
        <div className="book-card-title">{book.title}</div>
        {/* Author name */}
        <div className="book-card-author">by {book.author}</div>
        {/* Genre badges and language */}
        <div className="book-card-meta">
          {/* Handle both array and string genre formats */}
          {Array.isArray(book.genre) ? (
            // Map over genre array to show multiple badges
            book.genre.map(g => (
              <span key={g} className="badge badge-genre" style={{ marginRight: '4px' }}>{g}</span>
            ))
          ) : (
            // Single genre fallback
            <span className="badge badge-genre">{book.genre}</span>
          )}
          {/* Language label */}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{book.language}</span>
        </div>
        {/* Show expected availability date for out-of-stock books */}
        {!book.available && book.available_date && (
          <div style={{ fontSize: '0.78rem', color: 'var(--yellow)', marginTop: '6px' }}>
            Available from: {new Date(book.available_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  )
}
