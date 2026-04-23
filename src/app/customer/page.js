// Customer catalog page — browse all books with search and filters
// Fetches books once on mount, then filters client-side for instant results
'use client' // Client component — handles search, filter state, and user interaction

import { useState, useEffect, useMemo } from 'react' // React hooks
import { createClient } from '@/lib/supabase/client' // Browser Supabase client
import BookCard from '@/components/BookCard' // Book display card
import SearchBar from '@/components/SearchBar' // Search input
import FilterBar from '@/components/FilterBar' // Genre/language filter chips

export default function CatalogPage() {
  // State for books data and UI
  const [books, setBooks] = useState([]) // All books from database
  const [loading, setLoading] = useState(true) // Loading state
  const [search, setSearch] = useState('') // Search query string
  const [genre, setGenre] = useState('') // Selected genre filter (empty = all)
  const [language, setLanguage] = useState('') // Selected language filter (empty = all)
  const supabase = createClient() // Supabase client for fetching books

  // Fetch all books once on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      // Query all books, newest first
      const { data, error } = await supabase
        .from('books') // Target table
        .select('*') // Select all columns
        .order('created_at', { ascending: false }) // Newest books first

      // Store books in state if query succeeded
      if (!error && data) {
        setBooks(data)
      }
      setLoading(false) // Hide loading spinner
    }
    fetchBooks()
  }, []) // Empty deps = run once on mount

  // Filter books client-side — recalculates when search/genre/language changes
  // useMemo prevents unnecessary recalculations on every render
  const filtered = useMemo(() => {
    return books.filter((book) => {
      // Check if book matches search query (title or author, case-insensitive)
      const matchSearch = search === '' ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      // Check if book matches selected genre (supports array of genres)
      const matchGenre = genre === '' || (Array.isArray(book.genre) ? book.genre.includes(genre) : book.genre === genre)
      // Check if book matches selected language
      const matchLang = language === '' || book.language === language
      // Book must match ALL active filters
      return matchSearch && matchGenre && matchLang
    })
  }, [books, search, genre, language]) // Recalculate when any filter changes

  // Show loading spinner while fetching books
  if (loading) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ width: 40, height: 40 }}></span>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Book Catalog</h1>
        <p className="page-subtitle">Discover your next great read</p>
      </div>

      {/* Search bar and filter chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
        {/* Search by title or author */}
        <SearchBar value={search} onChange={setSearch} />
        {/* Genre and language filter chips */}
        <FilterBar
          selectedGenre={genre}
          onGenreChange={setGenre}
          selectedLanguage={language}
          onLanguageChange={setLanguage}
        />
      </div>

      {/* Book grid or empty state */}
      {filtered.length === 0 ? (
        // Empty state — no books match filters
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">
            {search || genre || language
              ? 'No books match your filters. Try adjusting your search.'
              : 'No books available yet. Check back soon!'}
          </div>
        </div>
      ) : (
        // Responsive grid of book cards
        <div className="book-grid">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
