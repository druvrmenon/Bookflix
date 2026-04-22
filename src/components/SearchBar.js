'use client'

export default function SearchBar({ value, onChange, placeholder = 'Search books by title or author...' }) {
  return (
    <div className="search-wrapper">
      <span className="search-icon">🔍</span>
      <input
        id="search-bar"
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  )
}
