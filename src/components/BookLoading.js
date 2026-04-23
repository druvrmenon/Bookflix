// BookLoading component — animated book SVG shown while data loads
// Replaces plain spinner with a clean book page-flip animation
'use client'

export default function BookLoading({ size = 60, text = '' }) {
  return (
    <div className="loading-page">
      {/* Animated book SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="book-loading-svg"
      >
        {/* Book spine */}
        <rect x="48" y="15" width="4" height="70" rx="2" fill="var(--rose-gold)" opacity="0.8" />
        {/* Left page (static) */}
        <path
          d="M48 15 H20 C18 15 16 17 16 19 V81 C16 83 18 85 20 85 H48"
          stroke="var(--rose-gold-light)"
          strokeWidth="2.5"
          fill="var(--brown-700)"
          opacity="0.6"
        />
        {/* Left page lines */}
        <line x1="24" y1="30" x2="42" y2="30" stroke="var(--rose-gold)" strokeWidth="1.5" opacity="0.3" />
        <line x1="24" y1="40" x2="40" y2="40" stroke="var(--rose-gold)" strokeWidth="1.5" opacity="0.2" />
        <line x1="24" y1="50" x2="38" y2="50" stroke="var(--rose-gold)" strokeWidth="1.5" opacity="0.15" />
        {/* Right page (static) */}
        <path
          d="M52 15 H80 C82 15 84 17 84 19 V81 C84 83 82 85 80 85 H52"
          stroke="var(--rose-gold-light)"
          strokeWidth="2.5"
          fill="var(--brown-700)"
          opacity="0.6"
        />
        {/* Flipping page (animated) */}
        <path
          d="M52 15 H80 C82 15 84 17 84 19 V81 C84 83 82 85 80 85 H52"
          stroke="var(--rose-gold)"
          strokeWidth="2"
          fill="var(--brown-600)"
          opacity="0.8"
          className="book-page-flip"
        />
      </svg>
      {/* Optional loading text */}
      {text && <div className="loading-text">{text}</div>}
    </div>
  )
}
