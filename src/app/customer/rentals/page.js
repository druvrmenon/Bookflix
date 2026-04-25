'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CustomerRentalsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('rent_requests')
        .select('*, books (id, title, author, cover_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setRequests(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const statusStyle = {
    pending: { bg: 'rgba(251, 191, 36, 0.12)', color: 'var(--yellow)', label: '⏳ Pending' },
    approved: { bg: 'var(--green-bg)', color: 'var(--green)', label: '✓ Approved' },
    rejected: { bg: 'var(--red-bg)', color: 'var(--red)', label: '✕ Rejected' },
    returned: { bg: 'rgba(201, 149, 108, 0.12)', color: 'var(--rose-gold)', label: '↩ Returned' },
  }

  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 className="page-title">My Rentals</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Track the status of your book rental requests.
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : requests.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't requested any books yet.</p>
          <Link href="/customer" className="btn btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map((req) => {
            const s = statusStyle[req.status] || statusStyle.pending
            return (
              <div key={req.id} style={{
                display: 'flex',
                gap: '14px',
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                alignItems: 'flex-start',
              }}>
                {req.books?.cover_url ? (
                  <Link href={`/customer/book/${req.books.id}`}>
                    <img src={req.books.cover_url} alt=""
                      style={{ width: '55px', height: '82px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  </Link>
                ) : (
                  <div style={{ width: '55px', height: '82px', backgroundColor: 'var(--brown-700)', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/customer/book/${req.books?.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.books?.title || 'Unknown'}
                    </h3>
                  </Link>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
                    by {req.books?.author || '?'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      backgroundColor: s.bg,
                      color: s.color,
                    }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
