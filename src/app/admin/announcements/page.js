'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminAnnouncements() {
  const supabase = createClient()
  const [users, setUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [recipient, setRecipient] = useState('ALL') // 'ALL' or specific user_id
  const [sending, setSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch users for dropdown
    const { data: userData } = await supabase.from('profiles').select('id, full_name').order('full_name')
    if (userData) setUsers(userData)

    // Fetch previous notifications
    const { data: notifData } = await supabase.from('notifications').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(20)
    if (notifData) setNotifications(notifData)
      
    setLoading(false)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    setSuccessMsg('')

    const userId = recipient === 'ALL' ? null : recipient

    const { error } = await supabase.from('notifications').insert({
      title,
      message,
      user_id: userId
    })

    if (!error) {
      setSuccessMsg('Announcement sent successfully!')
      setTitle('')
      setMessage('')
      setRecipient('ALL')
      fetchData() // refresh list
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      console.error(error)
      alert('Failed to send announcement.')
    }
    setSending(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    await supabase.from('notifications').delete().eq('id', id)
    fetchData()
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">Send notifications to all customers or specific users</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Send Form */}
        <div className="card">
          <h2 style={{ marginBottom: '16px', color: 'var(--gray-50)', fontSize: '1.2rem' }}>New Announcement</h2>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {successMsg && <div style={{ color: 'var(--green)', background: 'rgba(74, 222, 128, 0.1)', padding: '10px', borderRadius: '4px' }}>{successMsg}</div>}
            
            <div className="form-group">
              <label className="form-label">Recipient</label>
              <select className="form-select" value={recipient} onChange={e => setRecipient(e.target.value)}>
                <option value="ALL">All Users (Global Announcement)</option>
                <optgroup label="Specific Users">
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name || 'Unknown User'}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                required 
                className="form-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. System Maintenance, Rent Request Approved" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea 
                required 
                className="form-textarea" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                rows="4" 
                placeholder="Enter details here..." 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="card">
          <h2 style={{ marginBottom: '16px', color: 'var(--gray-50)', fontSize: '1.2rem' }}>Recent History</h2>
          
          {loading ? (
            <div className="spinner"></div>
          ) : notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No announcements sent yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map(n => (
                <div key={n.id} style={{ 
                  background: 'var(--brown-800)', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(201, 149, 108, 0.1)',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => handleDelete(n.id)}
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                  <div style={{ fontSize: '0.8rem', color: 'var(--rose-gold)', marginBottom: '4px', fontWeight: 600 }}>
                    {n.user_id ? `To: ${n.profiles?.full_name || 'User'}` : 'To: All Users'}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-50)' }}>{n.title}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
