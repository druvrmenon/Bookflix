'use client'

import { GENRES, LANGUAGES } from '@/lib/constants'

export default function FilterBar({ selectedGenre, onGenreChange, selectedLanguage, onLanguageChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Genre filters */}
      <div className="filter-bar">
        <button
          className={`filter-chip ${selectedGenre === '' ? 'active' : ''}`}
          onClick={() => onGenreChange('')}
        >
          All Genres
        </button>
        {GENRES.map((genre) => (
          <button
            key={genre}
            className={`filter-chip ${selectedGenre === genre ? 'active' : ''}`}
            onClick={() => onGenreChange(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Language filters */}
      <div className="filter-bar">
        <button
          className={`filter-chip ${selectedLanguage === '' ? 'active' : ''}`}
          onClick={() => onLanguageChange('')}
        >
          All Languages
        </button>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            className={`filter-chip ${selectedLanguage === lang ? 'active' : ''}`}
            onClick={() => onLanguageChange(lang)}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  )
}
