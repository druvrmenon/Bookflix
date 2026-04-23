// Wishlist page — shows books the customer has saved
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import BookLoading from '@/components/BookLoading'

export default function WishlistPage() {
  const [books, setBooks] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Fetch wishlist book IDs
      const { data: wishlistData } = await supabase
        .from('wishlists').select('book_id').eq('user_id', user.id)

      if (wishlistData && wishlistData.length > 0) {
        const bookIds = wishlistData.map(w => w.book_id)
        setWishlist(bookIds)

        // Fetch book details for wishlisted books
        const { data: booksData } = await supabase
          .from('books').select('*').in('id', bookIds)

        if (booksData) setBooks(booksData)
      }
      setLoading(false)
    }
    fetchWishlist()
  }, [])

  // Toggle wishlist
  const toggleWishlist = async (bookId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (wishlist.includes(bookId)) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('book_id', bookId)
      setWishlist(wishlist.filter(id => id !== bookId))
      setBooks(books.filter(b => b.id !== bookId))
    }
  }

  if (loading) return <BookLoading text="Loading wishlist..." />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">My Wishlist</h1>
        <p className="page-subtitle">{books.length} saved books</p>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <div className="empty-state-text">Your wishlist is empty. Tap the heart on books you love!</div>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} isWishlisted={true} onToggleWishlist={toggleWishlist} />
          ))}
        </div>
      )}
    </div>
  )
}
