'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminOnlineUsersPage() {
  const [onlineUsers, setOnlineUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('global-presence')

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('Presence state updated:', state)
        
        // Flatten the presence state (it returns an object where keys are the presence keys)
        const flattened = {}
        Object.keys(state).forEach((key) => {
          // Take the latest presence for each key (usually only one)
          flattened[key] = state[key][0]
        })
        setOnlineUsers(flattened)
        setLoading(false)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const userList = Object.values(onlineUsers).sort((a, b) => 
    new Date(b.online_at) - new Date(a.online_at)
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Live Activity</h1>
        <p className="page-subtitle">See who is browsing BookFlix right now.</p>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '30px' }}>
        <div className="card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--rose-gold)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--rose-gold)', marginBottom: '8px' }}>
            {userList.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Users Online
          </div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Current Page</th>
              <th>Active Since</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  Connecting to live stream...
                </td>
              </tr>
            ) : userList.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  No active users detected.
                </td>
              </tr>
            ) : (
              userList.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-50)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {u.user_id || 'Anonymous'}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-genre' : 'badge-available'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.85rem', color: 'var(--rose-gold)' }}>{u.current_page}</code>
                  </td>
                  <td>
                    {new Date(u.online_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
