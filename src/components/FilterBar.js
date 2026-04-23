// FilterBar component — horizontally scrollable genre and language filter chips
'use client' // Client component because it handles click events

import { GENRES, LANGUAGES } from '@/lib/constants' // Import available genres and languages

// Accepts selected values and change handlers from parent component
export default function FilterBar({ selectedGenre, onGenreChange, selectedLanguage, onLanguageChange }) {
  return (
    // Vertical stack of filter rows
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Genre filter chips — horizontally scrollable on mobile */}
      <div className="filter-bar">
        {/* "All Genres" chip — clears genre filter when clicked */}
        <button
          className={`filter-chip ${selectedGenre === '' ? 'active' : ''}`}
          onClick={() => onGenreChange('')} // Clear genre filter
        >
          All Genres
        </button>
        {/* One chip per genre from constants */}
        {GENRES.map((genre) => (
          <button
            key={genre}
            className={`filter-chip ${selectedGenre === genre ? 'active' : ''}`} // Highlight if selected
            onClick={() => onGenreChange(genre)} // Set this genre as filter
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Language filter chips */}
      <div className="filter-bar">
        {/* "All Languages" chip — clears language filter */}
        <button
          className={`filter-chip ${selectedLanguage === '' ? 'active' : ''}`}
          onClick={() => onLanguageChange('')} // Clear language filter
        >
          All Languages
        </button>
        {/* One chip per language from constants */}
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            className={`filter-chip ${selectedLanguage === lang ? 'active' : ''}`} // Highlight if selected
            onClick={() => onLanguageChange(lang)} // Set this language as filter
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  )
}
