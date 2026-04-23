// SearchBar component — text input for searching books by title or author
'use client' // Client component because it handles user input

// Accepts value (controlled input), onChange callback, and optional placeholder text
export default function SearchBar({ value, onChange, placeholder = 'Search books by title or author...' }) {
  return (
    // Wrapper div for positioning the search icon inside the input
    <div className="search-wrapper">
      {/* Search icon */}
      <span className="search-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
      {/* Search text input — controlled by parent component */}
      <input
        id="search-bar" // Unique ID for accessibility and testing
        type="text"
        className="search-input"
        placeholder={placeholder} // Hint text when empty
        value={value} // Controlled value from parent state
        onChange={(e) => onChange(e.target.value)} // Notify parent of text changes
        autoComplete="off" // Disable browser autocomplete suggestions
      />
    </div>
  )
}
