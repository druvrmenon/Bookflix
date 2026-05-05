// Public catalog page — browse all books with search, filters, sort
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import BookLoading from '@/components/BookLoading'

export default function PublicCatalogPage() {
  const PAGE_SIZE = 20
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [language, setLanguage] = useState('')
  const [sortBy, setSortBy] = useState('title-az') // Sort option — alphabetical default
  const supabase = createClient()

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
    setHasMore(true)
  }, [search, genre, language, sortBy])

  // Fetch paginated books
  useEffect(() => {
    const fetchBooks = async () => {
      if (page === 0) setLoading(true)
      else setFetchingMore(true)

      let query = supabase.from('books').select('*', { count: 'exact' })

      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
      }
      if (genre) {
        query = query.contains('genre', [genre])
      }
      if (language) {
        query = query.eq('language', language)
      }

      // Always show available books first, regardless of other sort options
      query = query.order('available', { ascending: false })

      switch (sortBy) {
        case 'title-az': query = query.order('title', { ascending: true }); break;
        case 'title-za': query = query.order('title', { ascending: false }); break;
        case 'author': query = query.order('author', { ascending: true }); break;
        case 'available': query = query.order('created_at', { ascending: false }); break;
        case 'newest': default: query = query.order('created_at', { ascending: false }); break;
      }

      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to)

      const { data } = await query

      if (data) {
        if (page === 0) setBooks(data)
        else setBooks(prev => [...prev, ...data])
        
        setHasMore(data.length === PAGE_SIZE)
      }

      setLoading(false)
      setFetchingMore(false)
    }

    fetchBooks()
  }, [page, search, genre, language, sortBy, supabase])

  // if (loading && page === 0) return <BookLoading text="Loading catalog..." />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Book Catalog</h1>
        <p className="page-subtitle">Discover your next great read</p>
      </div>

      {/* Search + Sort row */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <SearchBar value={search} onChange={setSearch} />
        </div>
        {/* Sort dropdown */}
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="title-az">Title A→Z</option>
          <option value="title-za">Title Z→A</option>
          <option value="author">Author</option>
          <option value="available">Available First</option>
        </select>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '28px' }}>
        <FilterBar
          selectedGenre={genre} onGenreChange={setGenre}
          selectedLanguage={language} onLanguageChange={setLanguage}
        />
      </div>

      {/* Book grid */}
      {loading && page === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div className="empty-state-text">
            {search || genre || language
              ? 'No books match your filters.'
              : 'No books available yet.'}
          </div>
        </div>
      ) : (
        <>
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}
          </div>
          
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setPage(p => p + 1)}
                disabled={fetchingMore}
              >
                {fetchingMore ? 'Loading...' : 'Load More Books'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
