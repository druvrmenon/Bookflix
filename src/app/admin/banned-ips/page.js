'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookLoading from '@/components/BookLoading'

export default function BannedIPsPage() {
  const [bannedIps, setBannedIps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newIp, setNewIp] = useState('')
  const [newReason, setNewReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchIps = async () => {
      const { data } = await supabase
        .from('banned_ips').select('*').order('created_at', { ascending: false })
      if (data) setBannedIps(data)
      setLoading(false)
    }
    fetchIps()
  }, [])

  const handleBanIp = async (e) => {
    e.preventDefault()
    if (!newIp.trim()) return

    setSubmitting(true)
    const ip = newIp.trim()
    const { error } = await supabase
      .from('banned_ips')
      .insert({ ip, reason: newReason.trim() || 'No reason provided' })

    if (!error) {
      setBannedIps([{ ip, reason: newReason.trim(), created_at: new Date().toISOString() }, ...bannedIps])
      setNewIp('')
      setNewReason('')
    } else {
      alert(error.message)
    }
    setSubmitting(false)
  }

  const handleUnbanIp = async (ipToUnban) => {
    if (!confirm(`Are you sure you want to unban IP: ${ipToUnban}?`)) return
    
    const { error } = await supabase
      .from('banned_ips')
      .delete()
      .eq('ip', ipToUnban)

    if (!error) {
      setBannedIps(bannedIps.filter(b => b.ip !== ipToUnban))
    } else {
      alert(error.message)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return bannedIps
    const q = search.toLowerCase()
    return bannedIps.filter(b => b.ip.toLowerCase().includes(q) || (b.reason && b.reason.toLowerCase().includes(q)))
  }, [bannedIps, search])

  if (loading) return <BookLoading text="Loading IP bans..." />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">IP Ban Management</h1>
        <p className="page-subtitle">Block specific IP addresses from accessing the site</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Ban New IP Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Ban New IP Address</h2>
          <form onSubmit={handleBanIp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">IP Address</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. 192.168.1.1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Reason (Optional)</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Spamming requests"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
              {submitting ? 'Banning...' : 'Ban IP'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="card" style={{ padding: '24px', background: 'rgba(248, 113, 113, 0.05)', borderColor: 'rgba(248, 113, 113, 0.2)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--red)' }}>⚠️ Warning</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            IP banning is a powerful tool but should be used carefully. 
            Many users on mobile networks or public Wi-Fi share the same IP address (CGNAT). 
            Banning one IP might accidentally block several innocent users.
          </p>
        </div>
      </div>

      {/* Search and List */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Currently Banned IPs ({bannedIps.length})</h2>
      <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Search banned IPs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '16px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No banned IPs found.</div>
        ) : (
          filtered.map((b) => (
            <div key={b.ip} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--red)', fontFamily: 'monospace' }}>{b.ip}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Reason: {b.reason || 'None'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Banned on: {new Date(b.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleUnbanIp(b.ip)}
                style={{ background: 'var(--green)', color: 'var(--bg)' }}
              >
                Unban
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
