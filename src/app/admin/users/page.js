// Admin user management page — search users, view roles, promote/demote
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookLoading from '@/components/BookLoading'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false })
      if (data) setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  // Toggle role between admin and customer
  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin'
    const { error } = await supabase
      .from('profiles').update({ role: newRole }).eq('id', user.id)

    if (!error) {
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u))
    }
  }

  // Filter users by search
  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      (u.full_name || '').toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    )
  }, [users, search])

  if (loading) return <BookLoading text="Loading users..." />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">{users.length} registered users</p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '16px' }}
        />
      </div>

      {/* Users list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((user) => (
          <div key={user.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{user.full_name || 'No name'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>{user.id}</div>
                <div style={{ marginTop: '6px' }}>
                  <span className={`badge ${user.role === 'admin' ? 'badge-genre' : 'badge-available'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                className={`btn btn-sm ${user.role === 'admin' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => toggleRole(user)}
              >
                {user.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
