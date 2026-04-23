// Customer catalog page — browse all books with search, filters, sort, and wishlist
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import BookLoading from '@/components/BookLoading'

export default function CatalogPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [language, setLanguage] = useState('')
  const [sortBy, setSortBy] = useState('newest') // Sort option
  const [wishlist, setWishlist] = useState([]) // Array of wishlisted book IDs
  const supabase = createClient()

  // Fetch books and wishlist on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch all books
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (booksData) setBooks(booksData)

      // Fetch user's wishlist
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: wishlistData } = await supabase
          .from('wishlists')
          .select('book_id')
          .eq('user_id', user.id)

        if (wishlistData) {
          setWishlist(wishlistData.map(w => w.book_id))
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  // Toggle wishlist — add or remove
  const toggleWishlist = async (bookId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (wishlist.includes(bookId)) {
      // Remove from wishlist
      await supabase.from('wishlists').delete()
        .eq('user_id', user.id).eq('book_id', bookId)
      setWishlist(wishlist.filter(id => id !== bookId))
    } else {
      // Add to wishlist
      await supabase.from('wishlists').insert([{ user_id: user.id, book_id: bookId }])
      setWishlist([...wishlist, bookId])
    }
  }

  // Filter and sort books — recalculates when any filter/sort changes
  const filtered = useMemo(() => {
    let result = books.filter((book) => {
      const matchSearch = search === '' ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      const matchGenre = genre === '' || (Array.isArray(book.genre) ? book.genre.includes(genre) : book.genre === genre)
      const matchLang = language === '' || book.language === language
      return matchSearch && matchGenre && matchLang
    })

    // Sort
    switch (sortBy) {
      case 'title-az':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title-za':
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'author':
        result.sort((a, b) => a.author.localeCompare(b.author))
        break
      case 'available':
        result.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0))
        break
      case 'newest':
      default:
        // Already sorted by newest from query
        break
    }

    return result
  }, [books, search, genre, language, sortBy])

  if (loading) return <BookLoading text="Loading catalog..." />

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
      {filtered.length === 0 ? (
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
        <div className="book-grid">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isWishlisted={wishlist.includes(book.id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  )
}
