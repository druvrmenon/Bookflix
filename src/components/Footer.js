// Footer component — shown at bottom of customer and admin pages
// Contains branding credit and Instagram link placeholder

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Branding credit */}
        <p className="footer-credit">
          Made with <span className="footer-heart">❤️</span> by Druv R Menon
        </p>
        {/* Social links */}
        <div className="footer-links">
          {/* Instagram link */}
          <a
            href="https://instagram.com/bookflix.kochi"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social"
            aria-label="Instagram"
          >
            {/* Instagram SVG icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
