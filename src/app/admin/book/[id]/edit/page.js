'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BookForm from '@/components/BookForm'

export default function EditBookPage() {
  const { id } = useParams()
  const supabase = createClient()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBook = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setBook(data)
      }
      setLoading(false)
    }
    fetchBook()
  }, [id])

  if (loading) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ width: 40, height: 40 }}></span>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <div className="empty-state-text">Book not found</div>
        <Link href="/admin" className="btn btn-secondary mt-2">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', marginBottom: '20px', fontSize: '0.9rem' }}>
        ← Back to Dashboard
      </Link>
      <div className="page-header">
        <h1 className="page-title">Edit Book</h1>
        <p className="page-subtitle">Update the details for &quot;{book.title}&quot;</p>
      </div>
      <BookForm book={book} />
    </div>
  )
}
