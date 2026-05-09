'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function SeriesExpandRow({ seriesName, volumes, onClose, basePath = '/customer/book' }) {
  if (!volumes || volumes.length === 0) return null;

  // Sort volumes by volume_number ascending
  const sortedVolumes = [...volumes].sort((a, b) => {
    const volA = a.volume_number || 0;
    const volB = b.volume_number || 0;
    return volA - volB;
  });

  return (
    <div className="series-expand-row">
      <div className="series-expand-header">
        <div>
          <h2 className="series-expand-title">{seriesName}</h2>
          <div className="series-expand-meta">
            {volumes.length} {volumes.length === 1 ? 'Volume' : 'Volumes'}
          </div>
        </div>
        <button 
          className="series-expand-close" 
          onClick={onClose}
          aria-label="Close expanded view"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="series-volumes-container">
        {sortedVolumes.map((book) => (
          <Link key={book.id} href={`${basePath}/${book.id}`} className="volume-card">
            <div className="volume-card-cover">
              {book.cover_url ? (
                <Image 
                  src={book.cover_url} 
                  alt={book.title} 
                  fill
                  sizes="160px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
              )}
            </div>
            <div className="volume-card-info">
              <div className="volume-card-title">Vol. {book.volume_number || '?'}</div>
              <span className={`volume-card-badge ${book.available ? 'badge-available' : 'badge-unavailable'}`} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                {book.available ? 'Available' : 'Out of Stock'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
