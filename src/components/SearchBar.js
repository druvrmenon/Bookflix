// SearchBar component — text input for searching books by title or author
'use client' // Client component because it handles user input

// Accepts value (controlled input), onChange callback, and optional placeholder text
export default function SearchBar({ value, onChange, placeholder = 'Search books by title or author...' }) {
  return (
    // Wrapper div for positioning the search icon inside the input
    <div className="search-wrapper">
      {/* Search icon — positioned absolutely inside the input */}
      <span className="search-icon">🔍</span>
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
