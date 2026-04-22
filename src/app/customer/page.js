'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'

export default function CatalogPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [language, setLanguage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setBooks(data)
      }
      setLoading(false)
    }
    fetchBooks()
  }, [])

  const filtered = useMemo(() => {
    return books.filter((book) => {
      const matchSearch = search === '' ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      const matchGenre = genre === '' || (Array.isArray(book.genre) ? book.genre.includes(genre) : book.genre === genre)
      const matchLang = language === '' || book.language === language
      return matchSearch && matchGenre && matchLang
    })
  }, [books, search, genre, language])

  if (loading) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ width: 40, height: 40 }}></span>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Book Catalog</h1>
        <p className="page-subtitle">Discover your next great read</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar
          selectedGenre={genre}
          onGenreChange={setGenre}
          selectedLanguage={language}
          onLanguageChange={setLanguage}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">
            {search || genre || language
              ? 'No books match your filters. Try adjusting your search.'
              : 'No books available yet. Check back soon!'}
          </div>
        </div>
      ) : (
        <div className="book-grid">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
