// BookLoading component — premium animated loading screen
// Smooth 3D page-flip animation with shimmer effect
'use client'

export default function BookLoading({ size = 70, text = '' }) {
  return (
    <div className="loading-page">
      <div className="book-loader" style={{ width: size, height: size * 0.75 }}>
        {/* Book base */}
        <div className="book-loader-inner">
          <div className="book-loader-page book-loader-page-1"></div>
          <div className="book-loader-page book-loader-page-2"></div>
          <div className="book-loader-page book-loader-page-3"></div>
          <div className="book-loader-page book-loader-page-4"></div>
          <div className="book-loader-cover"></div>
        </div>
      </div>
      {/* Loading text with shimmer */}
      {text && <div className="loading-text-shimmer">{text}</div>}
    </div>
  )
}
