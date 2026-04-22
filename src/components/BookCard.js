'use client'

import Link from 'next/link'

export default function BookCard({ book, basePath = '/customer/book' }) {
  const coverUrl = book.cover_url || null

  return (
    <Link href={`${basePath}/${book.id}`} className="card book-card">
      <div className="book-card-cover">
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} loading="lazy" />
        ) : (
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
        <div className="book-card-status">
          <span className={`badge ${book.available ? 'badge-available' : 'badge-unavailable'}`}>
            {book.available ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>
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
  )
}
