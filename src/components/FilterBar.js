// FilterBar component — horizontally scrollable genre and language filter chips
'use client' // Client component because it handles click events

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LANGUAGES } from '@/lib/constants'

export default function FilterBar({ selectedGenre, onGenreChange, selectedLanguage, onLanguageChange }) {
  const [dbGenres, setDbGenres] = useState([])
  const supabase = createClient()

  useEffect(() => {
    const fetchGenres = async () => {
      const { data } = await supabase.from('genres').select('name').order('name')
      if (data) setDbGenres(data.map(g => g.name))
    }
    fetchGenres()
  }, [supabase])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="filter-bar">
        <button
          className={`filter-chip ${selectedGenre === '' ? 'active' : ''}`}
          onClick={() => onGenreChange('')}
        >
          All Genres
        </button>
        {dbGenres.map((genre) => (
          <button
            key={genre}
            className={`filter-chip ${selectedGenre === genre ? 'active' : ''}`}
            onClick={() => onGenreChange(genre)}
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
