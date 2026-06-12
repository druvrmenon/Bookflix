'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Portal from '@/components/Portal'

export default function AdminRentRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [deliverModal, setDeliverModal] = useState(null)
  const [dueDate, setDueDate] = useState('')
  const [archiveFilter, setArchiveFilter] = useState('all')
  const [archiveSearch, setArchiveSearch] = useState('')
  const [groupByPerson, setGroupByPerson] = useState(false)
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

  const updateStatus = async (id, newStatus, extra = {}) => {
    try {
      setError(null)
      const { error: updateErr } = await supabase
        .from('rent_requests')
        .update({ status: newStatus, ...extra })
        .eq('id', id)

      if (updateErr) throw updateErr

      // Update book availability
      const req = requests.find(r => r.id === id)
      if (req && req.book_id) {
        if (newStatus === 'approved') {
          await supabase.from('books').update({
            available: false,
            available_date: null
          }).eq('id', req.book_id)
        } else if (newStatus === 'delivered') {
          await supabase.from('books').update({
            available: false,
            available_date: extra.due_date || null
          }).eq('id', req.book_id)
        } else if (newStatus === 'returned') {
          await supabase.from('books').update({
            available: true,
            available_date: null
          }).eq('id', req.book_id)
        }
      }

      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus, ...extra } : r))
    } catch (err) {
      console.error(err)
      setError('Failed to update status: ' + (err.message || 'Unknown error'))
    }
  }

  const handleApprove = async (reqId) => {
    await updateStatus(reqId, 'approved')
  }

  const handleDeliver = (reqId) => {
    const req = requests.find(r => r.id === reqId)
    const weeks = req?.duration_weeks || 2
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + (weeks * 7))
    setDueDate(defaultDate.toISOString().split('T')[0])
    setDeliverModal(reqId)
  }

  const confirmDeliver = async () => {
    if (!dueDate) return
    await updateStatus(deliverModal, 'delivered', { due_date: dueDate })
    setDeliverModal(null)
    setDueDate('')
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'rgba(251, 191, 36, 0.12)', color: 'var(--yellow)', border: 'rgba(251, 191, 36, 0.25)' },
      approved: { bg: 'var(--green-bg)', color: 'var(--green)', border: 'rgba(74, 222, 128, 0.25)' },
      delivered: { bg: 'rgba(99, 179, 237, 0.12)', color: '#63b3ed', border: 'rgba(99, 179, 237, 0.25)' },
      rejected: { bg: 'var(--red-bg)', color: 'var(--red)', border: 'rgba(248, 113, 113, 0.25)' },
      returned: { bg: 'rgba(201, 149, 108, 0.12)', color: 'var(--rose-gold)', border: 'rgba(201, 149, 108, 0.25)' },
    }
    const s = styles[status] || styles.pending
    return <span className="badge" style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  }

  // Categorise requests into the four sections
  const pendingReqs = requests.filter(r => r.status === 'pending')
  const approvedReqs = requests.filter(r => r.status === 'approved')
  const deliveredReqs = requests.filter(r => r.status === 'delivered')
  const returnedReqs = requests.filter(r => r.status === 'returned')
  const rejectedReqs = requests.filter(r => r.status === 'rejected')
  const archivedReqs = requests.filter(r => r.status === 'returned' || r.status === 'rejected')

  // Archive filter + search (rejected only shown when searching or grouping by person)
  const showRejected = archiveSearch.trim() !== '' || groupByPerson

  const filteredArchived = (() => {
    let base = archiveFilter === 'all'
      ? (showRejected ? archivedReqs : returnedReqs)
      : archiveFilter === 'returned' ? returnedReqs
        : rejectedReqs

    if (archiveSearch.trim()) {
      const q = archiveSearch.toLowerCase()
      base = base.filter(r =>
        (r.contact_name || '').toLowerCase().includes(q) ||
        (r.profiles?.full_name || '').toLowerCase().includes(q) ||
        (r.books?.title || '').toLowerCase().includes(q)
      )
    }
    return base
  })()

  const groupedByPerson = (() => {
    const groups = {}
    filteredArchived.forEach(req => {
      const name = req.contact_name || req.profiles?.full_name || 'Unknown'
      if (!groups[name]) groups[name] = []
      groups[name].push(req)
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  })()

  // ── Shared section header ───────────────────────────────────────────────────
  const SectionHeader = ({ icon, title, count, accent }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      marginBottom: '14px', marginTop: '28px',
    }}>
      <span style={{ fontSize: '1.15rem' }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: accent || 'var(--text)' }}>
        {title}
      </h2>
      <span style={{
        marginLeft: '4px', padding: '2px 10px', borderRadius: 'var(--radius-full)',
        background: `${accent}18`, color: accent, fontSize: '0.78rem', fontWeight: 700,
        border: `1px solid ${accent}35`,
      }}>{count}</span>
    </div>
  )

  // ── Full request card ───────────────────────────────────────────────────────
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0' }}>
            by {req.books?.author || '?'}
          </p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', margin: '4px 0 8px 0' }}>
            Rental: {req.duration_weeks || 2} weeks (₹{req.price || 70})
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            <p style={{ margin: '0 0 2px 0' }}>From: <strong style={{ color: 'var(--text)' }}>{req.contact_name || req.profiles?.full_name || 'Unknown'}</strong></p>
            <p style={{ margin: '0 0 2px 0' }}>📞 <a href={`tel:${req.phone}`} style={{ color: 'var(--rose-gold)', textDecoration: 'none' }}>{req.phone || 'No phone'}</a></p>
            {req.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '0 0 2px 0' }}>
                <span style={{ flexShrink: 0 }}>📍</span>
                <div style={{ flex: 1 }}>
                  {req.address}
                  {req.latitude && req.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${req.latitude},${req.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{
                        display: 'inline-flex',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        marginLeft: '8px',
                        background: 'rgba(201, 149, 108, 0.1)',
                        border: '1px solid var(--rose-gold)',
                        color: 'var(--rose-gold)',
                        textDecoration: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      Navigate
                    </a>
                  )}
                </div>
              </div>
            )}
            <p style={{ margin: '2px 0' }}>
              Payment: <strong>{req.payment_method === 'upi' ? 'UPI' : 'Cash'}</strong>
              {req.payment_method === 'upi' && (
                <span style={{
                  marginLeft: '6px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: req.payment_status === 'verified' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                  color: req.payment_status === 'verified' ? 'var(--green)' : 'var(--yellow)',
                  fontSize: '0.7rem'
                }}>
                  {req.payment_status}
                </span>
              )}
            </p>
            {req.payment_screenshot_url && (
              <a href={req.payment_screenshot_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '4px', color: 'var(--rose-gold)', textDecoration: 'underline' }}>
                View Screenshot
              </a>
            )}
            <p style={{ margin: '4px 0 0 0' }}>{new Date(req.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div>{getStatusBadge(req.status)}</div>
      </div>

      {req.status === 'delivered' && req.due_date && (
        <div style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(201, 149, 108, 0.1)' }}>
          🏃 Running till: <strong style={{ color: new Date(req.due_date) < new Date() ? 'var(--red)' : 'var(--text)' }}>
            {new Date(req.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </strong> (₹{req.price || 70})
          {new Date(req.due_date) < new Date() && <span style={{ color: 'var(--red)', marginLeft: '6px' }}>⚠️ OVERDUE</span>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid rgba(201, 149, 108, 0.1)', flexWrap: 'wrap' }}>
        {req.status === 'pending' && (
          <>
            <button onClick={() => handleApprove(req.id)} className="btn btn-sm"
              style={{ flex: 1, minHeight: '44px', backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--green)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
              Approve
            </button>
            <button onClick={() => updateStatus(req.id, 'rejected')} className="btn btn-sm btn-danger" style={{ flex: 1, minHeight: '44px' }}>
              Reject
            </button>
          </>
        )}
        {req.status === 'approved' && (
          <>
            {req.payment_method === 'upi' && req.payment_status !== 'verified' && (
              <button onClick={() => updateStatus(req.id, 'approved', { payment_status: 'verified' })} className="btn btn-sm btn-secondary" style={{ flex: 1, minHeight: '44px' }}>
                Verify Payment
              </button>
            )}
            <button
              onClick={() => handleDeliver(req.id)}
              className="btn btn-sm"
              style={{ flex: 1, minHeight: '44px', backgroundColor: 'rgba(99, 179, 237, 0.15)', color: '#63b3ed', border: '1px solid rgba(99, 179, 237, 0.3)' }}
            >
              Mark Delivered
            </button>
          </>
        )}
        {req.status === 'delivered' && (
          <button onClick={() => updateStatus(req.id, 'returned')} className="btn btn-sm btn-secondary" style={{ flex: 1, minHeight: '44px' }}>
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

  const EmptyState = ({ message }) => (
    <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)', margin: 0 }}>{message}</p>
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
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
          {/* ── 1. PENDING ─────────────────────────────────────────────── */}
          <SectionHeader icon="⏳" title="Pending Requests" count={pendingReqs.length} accent="var(--yellow)" />
          {pendingReqs.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {pendingReqs.map(renderCard)}
            </div>
          ) : (
            <EmptyState message="No pending requests 🎉" />
          )}

          {/* ── 2. TO BE DELIVERED ─────────────────────────────────────── */}
          {approvedReqs.length > 0 && (
            <>
              <SectionHeader icon="📦" title="To Be Delivered" count={approvedReqs.length} accent="var(--green)" />
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {approvedReqs.map(renderCard)}
              </div>
            </>
          )}

          {/* ── 3. TO BE RETURNED ──────────────────────────────────────── */}
          {deliveredReqs.length > 0 && (
            <>
              <SectionHeader icon="🔄" title="To Be Returned" count={deliveredReqs.length} accent="#63b3ed" />
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {deliveredReqs.map(renderCard)}
              </div>
            </>
          )}

          {/* ── 4. ARCHIVED (returned + rejected) ─────────────────────── */}
          {archivedReqs.length > 0 && (
            <div style={{ marginTop: '28px' }}>
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
                <span>📁 Archived ({archivedReqs.length})</span>
                <span style={{ transform: archiveOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '1.2rem' }}>▼</span>
              </button>

              {archiveOpen && (
                <div style={{ marginTop: '1rem' }}>
                  {/* Search + Group toggle */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search by name or book..."
                        value={archiveSearch}
                        onChange={e => setArchiveSearch(e.target.value)}
                        style={{ paddingLeft: '36px', minHeight: '40px', fontSize: '0.85rem' }}
                      />
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: '0.9rem', pointerEvents: 'none' }}>🔍</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGroupByPerson(!groupByPerson)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: groupByPerson ? '1px solid var(--rose-gold)' : '1px solid var(--brown-500)',
                        background: groupByPerson ? 'rgba(201, 149, 108, 0.12)' : 'transparent',
                        color: groupByPerson ? 'var(--rose-gold)' : 'var(--text-dim)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minHeight: '40px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      👤 Group by Person
                    </button>
                  </div>

                  {/* Filter tabs — only Returned + Rejected */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[
                      { key: 'all', label: 'All', count: archivedReqs.length, color: 'var(--text-muted)' },
                      { key: 'returned', label: 'Returned', count: returnedReqs.length, color: 'var(--rose-gold)' },
                      { key: 'rejected', label: 'Rejected', count: rejectedReqs.length, color: 'var(--red)' },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setArchiveFilter(tab.key)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          border: archiveFilter === tab.key ? `1px solid ${tab.color}` : '1px solid var(--brown-500)',
                          background: archiveFilter === tab.key ? `${tab.color}15` : 'transparent',
                          color: archiveFilter === tab.key ? tab.color : 'var(--text-dim)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minHeight: '36px',
                        }}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>

                  {filteredArchived.length === 0 ? (
                    <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem 0' }}>
                      {archiveSearch ? `No results for "${archiveSearch}"` : `No ${archiveFilter} requests.`}
                    </p>
                  ) : groupByPerson ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {groupedByPerson.map(([personName, personReqs]) => (
                        <div key={personName} style={{
                          border: '1px solid rgba(201, 149, 108, 0.12)',
                          borderRadius: 'var(--radius-lg)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            padding: '14px 18px',
                            background: 'rgba(201, 149, 108, 0.06)',
                            borderBottom: '1px solid rgba(201, 149, 108, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--rose-gold), var(--rose-gold-dark))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--brown-900)', fontWeight: 800, fontSize: '0.85rem',
                              }}>
                                {personName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{personName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                  {personReqs.length} request{personReqs.length !== 1 ? 's' : ''}
                                  {personReqs[0]?.phone && (
                                    <> · <a href={`tel:${personReqs[0].phone}`} style={{ color: 'var(--rose-gold)', textDecoration: 'none' }}>{personReqs[0].phone}</a></>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ padding: '8px' }}>
                            {personReqs.map(req => (
                              <div key={req.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius)',
                                transition: 'background 0.15s',
                              }}>
                                {req.books?.cover_url && (
                                  <img src={req.books.cover_url} alt="" style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {req.books?.title || 'Unknown'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                    {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    {req.status === 'delivered' && req.due_date && (
                                      <span style={{ color: new Date(req.due_date) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
                                        {' '}· Running till {new Date(req.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (₹{req.price || 70})
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>{getStatusBadge(req.status)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                      {filteredArchived.map(renderCard)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Mark Delivered — set due date modal */}
      {deliverModal && (() => {
        const activeReq = requests.find(r => r.id === deliverModal)
        const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'
        return (
          <Portal>
            <div className="crop-modal" onClick={() => setDeliverModal(null)}>
              <div onClick={e => e.stopPropagation()} style={{
                background: 'var(--brown-800)',
                border: '1px solid rgba(201, 149, 108, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                width: 'calc(100vw - 32px)',
                maxWidth: '380px',
                boxShadow: 'var(--shadow-lg)',
              }}>
                <h3 style={{ color: 'var(--gray-50)', marginBottom: '4px', fontSize: '1.1rem' }}>Mark as Delivered</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Set the return date for this rental.
                </p>

                {activeReq && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 'var(--radius)',
                    background: 'rgba(201, 149, 108, 0.08)',
                    border: '1px solid rgba(201, 149, 108, 0.2)',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}>
                    <p style={{ margin: '0 0 4px 0', color: 'var(--rose-gold)', fontWeight: 600 }}>Rental Details:</p>
                    <p style={{ margin: '0 0 2px 0', color: 'var(--text)' }}>
                      🏃 Running till: <strong style={{ color: 'var(--gray-50)' }}>{formattedDueDate}</strong>
                    </p>
                    <p style={{ margin: 0, color: activeReq.payment_method === 'upi' ? 'var(--green)' : 'var(--yellow)' }}>
                      💰 {activeReq.payment_method === 'upi' ? `Paid ₹${activeReq.price || 70} via UPI` : `Collect ₹${activeReq.price || 70} in Cash`}
                    </p>
                  </div>
                )}

                <div className="form-group" style={{ margin: '0 0 16px 0' }}>
                  <label className="form-label" htmlFor="due-date">Return By *</label>
                  <input id="due-date" className="form-input" type="date"
                    value={dueDate} onChange={e => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                    onClick={() => setDeliverModal(null)}>Cancel</button>
                  <button type="button" className="btn btn-sm" style={{
                    flex: 1, backgroundColor: 'rgba(99, 179, 237, 0.15)', color: '#63b3ed',
                    border: '1px solid rgba(99, 179, 237, 0.3)', minHeight: '40px', fontSize: '0.95rem'
                  }} onClick={confirmDeliver}>
                    Confirm Delivered
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )
      })()}
    </div>
  )
}
