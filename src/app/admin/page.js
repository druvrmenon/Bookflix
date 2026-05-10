// Admin dashboard — manage books with stats, availability toggle, new badge toggle
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/Modal'
import BookLoading from '@/components/BookLoading'
import TableSkeleton from '@/components/TableSkeleton'
import Skeleton from '@/components/Skeleton'
import Portal from '@/components/Portal'

export default function AdminDashboard() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [dateModal, setDateModal] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const supabase = createClient()

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      // Sort to group series together
      data.sort((a, b) => {
        if (a.series_name && b.series_name) {
          if (a.series_name === b.series_name) {
            return (a.volume_number || 0) - (b.volume_number || 0)
          }
          return a.series_name.localeCompare(b.series_name)
        }
        if (a.series_name) return -1
        if (b.series_name) return 1
        return 0 // Keep original created_at ordering for standalone books
      })
      setBooks(data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchBooks() }, [])

  // Calculate stats from local data
  const totalBooks = books.length
  const availableBooks = books.filter(b => b.available).length
  const outOfStock = totalBooks - availableBooks

  // Filter books based on search
  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      book.title?.toLowerCase().includes(q) ||
      book.series_name?.toLowerCase().includes(q) ||
      book.author?.toLowerCase().includes(q) ||
      (Array.isArray(book.genre) 
        ? book.genre.some(g => g.toLowerCase().includes(q))
        : book.genre?.toLowerCase().includes(q))
    )
  })

  // Toggle availability
  const toggleAvailability = async (book) => {
    if (book.available) {
      setDateModal(book)
      setSelectedDate('')
    } else {
      const { error } = await supabase
        .from('books').update({ available: true, available_date: null }).eq('id', book.id)
      if (!error) {
        setBooks(books.map(b => b.id === book.id ? { ...b, available: true, available_date: null } : b))
      }
    }
  }

  const confirmOutOfStock = async () => {
    if (!dateModal) return
    const { error } = await supabase
      .from('books').update({ available: false, available_date: selectedDate || null }).eq('id', dateModal.id)
    if (!error) {
      setBooks(books.map(b => b.id === dateModal.id ? { ...b, available: false, available_date: selectedDate || null } : b))
    }
    setDateModal(null)
  }

  // Toggle "NEW" badge: null (auto) → true (on) → false (off) → null (auto)
  const cycleNewBadge = async (book) => {
    let newValue
    if (book.show_new_badge === null || book.show_new_badge === undefined) newValue = true
    else if (book.show_new_badge === true) newValue = false
    else newValue = null

    const { error } = await supabase
      .from('books').update({ show_new_badge: newValue }).eq('id', book.id)
    if (!error) {
      setBooks(books.map(b => b.id === book.id ? { ...b, show_new_badge: newValue } : b))
    }
  }

  // Get badge label
  const getBadgeLabel = (val) => {
    if (val === true) return 'ON'
    if (val === false) return 'OFF'
    return 'AUTO'
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    if (deleteModal.cover_url) {
      const path = deleteModal.cover_url.split('/book-covers/')[1]
      if (path) await supabase.storage.from('book-covers').remove([path])
    }
    if (deleteModal.back_cover_url) {
      const path = deleteModal.back_cover_url.split('/book-covers/')[1]
      if (path) await supabase.storage.from('book-covers').remove([path])
    }
    const { error } = await supabase.from('books').delete().eq('id', deleteModal.id)
    if (!error) setBooks(books.filter(b => b.id !== deleteModal.id))
    setDeleteModal(null)
  }

  if (loading) {
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Skeleton width="200px" height="32px" style={{ marginBottom: '8px' }} />
            <Skeleton width="150px" height="16px" />
          </div>
          <Skeleton width="120px" height="40px" />
        </div>
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <Skeleton height="100px" borderRadius="var(--radius-lg)" />
          <Skeleton height="100px" borderRadius="var(--radius-lg)" />
          <Skeleton height="100px" borderRadius="var(--radius-lg)" />
        </div>
        <TableSkeleton rows={8} columns={6} />
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">{totalBooks} books in catalog</p>
        </div>
        <Link href="/admin/book/new" className="btn btn-primary">+ Add Book</Link>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value">{totalBooks}</div>
          <div className="stat-card-label">Total Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--green)' }}>{availableBooks}</div>
          <div className="stat-card-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--red)' }}>{outOfStock}</div>
          <div className="stat-card-label">Out of Stock</div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ margin: '24px 0', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="search-wrapper">
          <div className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, series, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button className="btn btn-secondary btn-sm" onClick={() => setSearchQuery('')} style={{ minHeight: '44px', borderRadius: 'var(--radius-full)' }}>
            Clear
          </button>
        )}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div className="empty-state-text">
            {searchQuery ? `No results found for "${searchQuery}"` : "No books yet. Add your first book!"}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Series</th>
                  <th>Vol</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>NEW</th>
                  <th>Available Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <div style={{ width: '40px', height: '60px', borderRadius: '4px', overflow: 'hidden', background: 'var(--brown-700)' }}>
                        {book.cover_url ? (
                          <img src={book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.6rem' }}>NO IMG</div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{book.title}</td>
                    <td>{book.series_name || '—'}</td>
                    <td>{book.volume_number || '—'}</td>
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
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => cycleNewBadge(book)}
                        style={{ fontSize: '0.75rem', minHeight: '28px', padding: '4px 10px' }}
                      >
                        {getBadgeLabel(book.show_new_badge)}
                      </button>
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
                        <Link href={`/admin/book/${book.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(book)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="admin-card-list">
            {filteredBooks.map((book) => (
              <div key={book.id} className="card admin-card">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '80px', height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--brown-700)', flexShrink: 0 }}>
                    {book.cover_url ? (
                      <img src={book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.7rem' }}>NO IMAGE</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="admin-card-header" style={{ marginBottom: '8px', padding: 0 }}>
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
                    <div className={`badge ${book.available ? 'badge-available' : 'badge-unavailable'}`} style={{ fontSize: '0.7rem' }}>
                      {book.available ? 'Available' : 'Out of Stock'}
                    </div>
                  </div>
                </div>
                {book.series_name && (
                  <div className="admin-card-row">
                    <span className="admin-card-label">Series</span>
                    <span>{book.series_name} (Vol. {book.volume_number || '?'})</span>
                  </div>
                )}
                <div className="admin-card-row">
                  <span className="admin-card-label">Genre</span>
                  <div style={{ textAlign: 'right' }}>
                    {Array.isArray(book.genre) ? (
                      book.genre.map(g => (<span key={g} className="badge badge-genre" style={{ marginLeft: '4px', marginBottom: '4px', display: 'inline-block' }}>{g}</span>))
                    ) : (<span className="badge badge-genre">{book.genre}</span>)}
                  </div>
                </div>
                <div className="admin-card-row">
                  <span className="admin-card-label">Language</span>
                  <span>{book.language}</span>
                </div>
                <div className="admin-card-row">
                  <span className="admin-card-label">NEW Badge</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => cycleNewBadge(book)}
                    style={{ fontSize: '0.75rem', minHeight: '28px', padding: '4px 10px' }}>
                    {getBadgeLabel(book.show_new_badge)}
                  </button>
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
                  <Link href={`/admin/book/${book.id}/edit`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Edit</Link>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => setDeleteModal(book)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <Modal title="Delete Book"
          message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
          confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteModal(null)} />
      )}

      {/* Date picker modal */}
      {dateModal && (
        <Portal>
        <div className="date-picker-popup" onClick={() => setDateModal(null)}>
          <div className="date-picker-card" onClick={e => e.stopPropagation()}>
            <h3>Set Available Date</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              When will &quot;{dateModal.title}&quot; be available again?
            </p>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="available-date">Expected Date</label>
              <input id="available-date" type="date" className="form-input" value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDateModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmOutOfStock}>Mark Out of Stock</button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  )
}
