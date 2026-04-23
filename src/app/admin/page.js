// Admin dashboard — manage all books in the catalog
// Features: book list (table on desktop, cards on mobile), availability toggle,
// out-of-stock date picker, edit/delete actions
'use client' // Client component — handles state, modals, and database mutations

import { useState, useEffect } from 'react' // React hooks
import Link from 'next/link' // Next.js optimized link
import { createClient } from '@/lib/supabase/client' // Browser Supabase client
import Modal from '@/components/Modal' // Confirmation modal component

export default function AdminDashboard() {
  // Component state
  const [books, setBooks] = useState([]) // All books from database
  const [loading, setLoading] = useState(true) // Loading state
  const [deleteModal, setDeleteModal] = useState(null) // Book to delete (null = modal closed)
  const [dateModal, setDateModal] = useState(null) // Book for date picker (null = modal closed)
  const [selectedDate, setSelectedDate] = useState('') // Selected availability date
  const supabase = createClient() // Supabase client

  // Fetch all books from database, newest first
  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books') // Target table
      .select('*') // All columns
      .order('created_at', { ascending: false }) // Newest first

    if (!error && data) {
      setBooks(data) // Store books in state
    }
    setLoading(false) // Hide spinner
  }

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks()
  }, []) // Run once

  // Toggle book availability — admins only
  const toggleAvailability = async (book) => {
    if (book.available) {
      // Currently available → marking as out of stock
      // Show date picker modal to set expected return date
      setDateModal(book)
      setSelectedDate('')
    } else {
      // Currently out of stock → marking as available
      const { error } = await supabase
        .from('books')
        .update({ available: true, available_date: null }) // Clear the date too
        .eq('id', book.id) // Match by book ID

      if (!error) {
        // Update local state immediately (optimistic update — no refetch needed)
        setBooks(books.map(b => b.id === book.id ? { ...b, available: true, available_date: null } : b))
      }
    }
  }

  // Confirm marking a book as out of stock with a date
  const confirmOutOfStock = async () => {
    if (!dateModal) return // Safety check

    // Update book in database
    const { error } = await supabase
      .from('books')
      .update({
        available: false, // Mark as out of stock
        available_date: selectedDate || null, // Set return date (or null if not specified)
      })
      .eq('id', dateModal.id) // Match by book ID

    if (!error) {
      // Optimistic update — update local state without refetching
      setBooks(books.map(b =>
        b.id === dateModal.id
          ? { ...b, available: false, available_date: selectedDate || null }
          : b
      ))
    }
    setDateModal(null) // Close modal
  }

  // Delete a book and its cover image from storage
  const handleDelete = async () => {
    if (!deleteModal) return // Safety check

    // Delete cover image from Supabase Storage if it exists
    if (deleteModal.cover_url) {
      // Extract storage path from the full public URL
      const path = deleteModal.cover_url.split('/book-covers/')[1]
      if (path) {
        await supabase.storage.from('book-covers').remove([path]) // Delete file
      }
    }

    // Delete book row from database
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', deleteModal.id) // Match by book ID

    if (!error) {
      // Remove from local state (optimistic update)
      setBooks(books.filter(b => b.id !== deleteModal.id))
    }
    setDeleteModal(null) // Close modal
  }

  // Loading spinner while fetching data
  if (loading) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ width: 40, height: 40 }}></span>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Page header with title and Add Book button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">{books.length} books in catalog</p>
        </div>
        {/* Link to add new book form */}
        <Link href="/admin/book/new" className="btn btn-primary">
          + Add Book
        </Link>
      </div>

      {/* Empty state when no books exist */}
      {books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">No books yet. Add your first book!</div>
        </div>
      ) : (
        <>
          {/* ===== Desktop Table View ===== */}
          {/* Hidden on mobile via CSS (.admin-table-wrap display:none on small screens) */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Available Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    {/* Book title — bold */}
                    <td style={{ fontWeight: 600 }}>{book.title}</td>
                    {/* Author name */}
                    <td>{book.author}</td>
                    {/* Genre badges — supports array of genres */}
                    <td>
                      {Array.isArray(book.genre) ? (
                        book.genre.map(g => (
                          <span key={g} className="badge badge-genre" style={{ marginRight: '4px', marginBottom: '4px', display: 'inline-block' }}>{g}</span>
                        ))
                      ) : (
                        <span className="badge badge-genre">{book.genre}</span>
                      )}
                    </td>
                    {/* Language */}
                    <td>{book.language}</td>
                    {/* Availability toggle switch */}
                    <td>
                      <button
                        className={`toggle ${book.available ? 'active' : ''}`}
                        onClick={() => toggleAvailability(book)}
                        title={book.available ? 'Mark out of stock' : 'Mark available'}
                        aria-label={`Toggle availability for ${book.title}`}
                      />
                    </td>
                    {/* Expected availability date (only shown when out of stock) */}
                    <td>
                      {!book.available && book.available_date ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--yellow)' }}>
                          {new Date(book.available_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    {/* Edit and Delete action buttons */}
                    <td>
                      <div className="admin-table-actions">
                        <Link href={`/admin/book/${book.id}/edit`} className="btn btn-secondary btn-sm">
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteModal(book)} // Open delete confirmation modal
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== Mobile Card View ===== */}
          {/* Shown on mobile, hidden on desktop via CSS */}
          <div className="admin-card-list">
            {books.map((book) => (
              <div key={book.id} className="card admin-card">
                {/* Card header — title, author, and toggle */}
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">{book.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>by {book.author}</div>
                  </div>
                  {/* Availability toggle */}
                  <button
                    className={`toggle ${book.available ? 'active' : ''}`}
                    onClick={() => toggleAvailability(book)}
                    aria-label={`Toggle availability for ${book.title}`}
                  />
                </div>
                {/* Genre row */}
                <div className="admin-card-row">
                  <span className="admin-card-label">Genre</span>
                  <div style={{ textAlign: 'right' }}>
                    {Array.isArray(book.genre) ? (
                      book.genre.map(g => (
                        <span key={g} className="badge badge-genre" style={{ marginLeft: '4px', marginBottom: '4px', display: 'inline-block' }}>{g}</span>
                      ))
                    ) : (
                      <span className="badge badge-genre">{book.genre}</span>
                    )}
                  </div>
                </div>
                {/* Language row */}
                <div className="admin-card-row">
                  <span className="admin-card-label">Language</span>
                  <span>{book.language}</span>
                </div>
                {/* Status badge */}
                <div className="admin-card-row">
                  <span className="admin-card-label">Status</span>
                  <span className={`badge ${book.available ? 'badge-available' : 'badge-unavailable'}`}>
                    {book.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                {/* Available from date (only when out of stock with date set) */}
                {!book.available && book.available_date && (
                  <div className="admin-card-row">
                    <span className="admin-card-label">Available From</span>
                    <span style={{ color: 'var(--yellow)', fontSize: '0.85rem' }}>
                      {new Date(book.available_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {/* Edit and Delete buttons */}
                <div className="admin-card-actions">
                  <Link href={`/admin/book/${book.id}/edit`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setDeleteModal(book)} // Open delete modal
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      {deleteModal && (
        <Modal
          title="Delete Book"
          message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          danger // Red button styling
          onConfirm={handleDelete} // Delete book
          onCancel={() => setDeleteModal(null)} // Close modal
        />
      )}

      {/* ===== Out of Stock Date Picker Modal ===== */}
      {dateModal && (
        // Full-screen overlay — click outside to close
        <div className="date-picker-popup" onClick={() => setDateModal(null)}>
          {/* Modal card — stop propagation so clicking inside doesn't close */}
          <div className="date-picker-card" onClick={e => e.stopPropagation()}>
            <h3>Set Available Date</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              When will &quot;{dateModal.title}&quot; be available again?
            </p>
            {/* Date picker input */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="available-date">Expected Date</label>
              <input
                id="available-date"
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Can't pick past dates
              />
            </div>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDateModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmOutOfStock}>
                Mark Out of Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
