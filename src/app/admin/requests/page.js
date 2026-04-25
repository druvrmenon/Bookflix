'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminRentRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const { data, error: fetchErr } = await supabase
        .from('rent_requests')
        .select(`
          *,
          profiles (full_name),
          books (title, author, cover_url)
        `)
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr
      setRequests(data || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load rent requests.')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      setError(null)
      const { error: updateErr } = await supabase
        .from('rent_requests')
        .update({ status: newStatus })
        .eq('id', id)

      if (updateErr) throw updateErr
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r))
    } catch (err) {
      console.error(err)
      setError('Failed to update status.')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'rgba(251, 191, 36, 0.12)', color: 'var(--yellow)', border: 'rgba(251, 191, 36, 0.25)' },
      approved: { bg: 'var(--green-bg)', color: 'var(--green)', border: 'rgba(74, 222, 128, 0.25)' },
      rejected: { bg: 'var(--red-bg)', color: 'var(--red)', border: 'rgba(248, 113, 113, 0.25)' },
      returned: { bg: 'rgba(201, 149, 108, 0.12)', color: 'var(--rose-gold)', border: 'rgba(201, 149, 108, 0.25)' },
    }
    const s = styles[status] || styles.pending
    return <span className="badge" style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  }

  const pendingReqs = requests.filter(r => r.status === 'pending')
  const archivedReqs = requests.filter(r => r.status !== 'pending')

  const renderCard = (req) => (
    <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '12px', padding: '16px' }}>
        {req.books?.cover_url && (
          <img src={req.books.cover_url} alt="" style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {req.books?.title || 'Unknown Book'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
            by {req.books?.author || '?'}
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            <p style={{ margin: '0 0 2px 0' }}>From: <strong style={{ color: 'var(--text)' }}>{req.contact_name || req.profiles?.full_name || 'Unknown'}</strong></p>
            <p style={{ margin: '0 0 2px 0' }}>📞 <a href={`tel:${req.phone}`} style={{ color: 'var(--rose-gold)', textDecoration: 'none' }}>{req.phone || 'No phone'}</a></p>
            {req.address && <p style={{ margin: '0 0 2px 0' }}>📍 {req.address}</p>}
            <p style={{ margin: 0 }}>{new Date(req.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div>{getStatusBadge(req.status)}</div>
      </div>

      <div style={{ display: 'flex', gap: '6px', padding: '12px 16px', borderTop: '1px solid rgba(201, 149, 108, 0.1)', flexWrap: 'wrap' }}>
        {req.status === 'pending' && (
          <>
            <button onClick={() => updateStatus(req.id, 'approved')} className="btn btn-sm"
              style={{ flex: 1, backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--green)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
              Approve
            </button>
            <button onClick={() => updateStatus(req.id, 'rejected')} className="btn btn-sm btn-danger" style={{ flex: 1 }}>
              Reject
            </button>
          </>
        )}
        {req.status === 'approved' && (
          <button onClick={() => updateStatus(req.id, 'returned')} className="btn btn-sm btn-secondary" style={{ flex: 1 }}>
            Mark Returned
          </button>
        )}
        {(req.status === 'rejected' || req.status === 'returned') && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '8px 0', textAlign: 'center', width: '100%' }}>
            No actions available
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Rent Requests</h1>
          <p className="page-subtitle">Manage book rental requests from customers.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--red-bg)', color: 'var(--red)', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No rent requests yet.</p>
        </div>
      ) : (
        <>
          {/* Pending requests */}
          {pendingReqs.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {pendingReqs.map(renderCard)}
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No pending requests 🎉</p>
            </div>
          )}

          {/* Archived requests dropdown */}
          {archivedReqs.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => setArchiveOpen(!archiveOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(201, 149, 108, 0.12)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <span>Archived Requests ({archivedReqs.length})</span>
                <span style={{ transform: archiveOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '1.2rem' }}>▼</span>
              </button>

              {archiveOpen && (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: '1rem' }}>
                  {archivedReqs.map(renderCard)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
