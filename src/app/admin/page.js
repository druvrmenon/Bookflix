'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/Modal'

export default function AdminDashboard() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null)
  const [dateModal, setDateModal] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const supabase = createClient()

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

  useEffect(() => {
    fetchBooks()
  }, [])

  const toggleAvailability = async (book) => {
    if (book.available) {
      // Marking as out of stock — show date picker
      setDateModal(book)
      setSelectedDate('')
    } else {
      // Marking as available
      const { error } = await supabase
        .from('books')
        .update({ available: true, available_date: null })
        .eq('id', book.id)

      if (!error) {
        setBooks(books.map(b => b.id === book.id ? { ...b, available: true, available_date: null } : b))
      }
    }
  }

  const confirmOutOfStock = async () => {
    if (!dateModal) return

    const { error } = await supabase
      .from('books')
      .update({
        available: false,
        available_date: selectedDate || null,
      })
      .eq('id', dateModal.id)

    if (!error) {
      setBooks(books.map(b =>
        b.id === dateModal.id
          ? { ...b, available: false, available_date: selectedDate || null }
          : b
      ))
    }
    setDateModal(null)
  }

  const handleDelete = async () => {
    if (!deleteModal) return

    // Delete cover from storage if exists
    if (deleteModal.cover_url) {
      const path = deleteModal.cover_url.split('/book-covers/')[1]
      if (path) {
        await supabase.storage.from('book-covers').remove([path])
      }
    }

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', deleteModal.id)

    if (!error) {
      setBooks(books.filter(b => b.id !== deleteModal.id))
    }
    setDeleteModal(null)
  }

  if (loading) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ width: 40, height: 40 }}></span>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">{books.length} books in catalog</p>
        </div>
        <Link href="/admin/book/new" className="btn btn-primary">
          + Add Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">No books yet. Add your first book!</div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
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
                    <td style={{ fontWeight: 600 }}>{book.title}</td>
                    <td>{book.author}</td>
                    <td>
                      {Array.isArray(book.genre) ? (
                        book.genre.map(g => (
                          <span key={g} className="badge badge-genre" style={{ marginRight: '4px', marginBottom: '4px', display: 'inline-block' }}>{g}</span>
                        ))
                      ) : (
                        <span className="badge badge-genre">{book.genre}</span>
                      )}
                    </td>
                    <td>{book.language}</td>
                    <td>
                      <button
                        className={`toggle ${book.available ? 'active' : ''}`}
                        onClick={() => toggleAvailability(book)}
                        title={book.available ? 'Mark out of stock' : 'Mark available'}
                        aria-label={`Toggle availability for ${book.title}`}
                      />
                    </td>
                    <td>
                      {!book.available && book.available_date ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--yellow)' }}>
                          {new Date(book.available_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <Link href={`/admin/book/${book.id}/edit`} className="btn btn-secondary btn-sm">
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteModal(book)}
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

          {/* Mobile Card List */}
          <div className="admin-card-list">
            {books.map((book) => (
              <div key={book.id} className="card admin-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">{book.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>by {book.author}</div>
                  </div>
                  <button
                    className={`toggle ${book.available ? 'active' : ''}`}
                    onClick={() => toggleAvailability(book)}
                    aria-label={`Toggle availability for ${book.title}`}
                  />
                </div>
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
                <div className="admin-card-row">
                  <span className="admin-card-label">Language</span>
                  <span>{book.language}</span>
                </div>
                <div className="admin-card-row">
                  <span className="admin-card-label">Status</span>
                  <span className={`badge ${book.available ? 'badge-available' : 'badge-unavailable'}`}>
                    {book.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                {!book.available && book.available_date && (
                  <div className="admin-card-row">
                    <span className="admin-card-label">Available From</span>
                    <span style={{ color: 'var(--yellow)', fontSize: '0.85rem' }}>
                      {new Date(book.available_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="admin-card-actions">
                  <Link href={`/admin/book/${book.id}/edit`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setDeleteModal(book)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <Modal
          title="Delete Book"
          message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* Date picker modal for out of stock */}
      {dateModal && (
        <div className="date-picker-popup" onClick={() => setDateModal(null)}>
          <div className="date-picker-card" onClick={e => e.stopPropagation()}>
            <h3>Set Available Date</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              When will &quot;{dateModal.title}&quot; be available again?
            </p>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="available-date">Expected Date</label>
              <input
                id="available-date"
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
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
