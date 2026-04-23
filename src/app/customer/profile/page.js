// Profile page — view and edit user name
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookLoading from '@/components/BookLoading'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email)
        const { data } = await supabase
          .from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setProfile(data)
          setFullName(data.full_name || '')
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('profiles').update({ full_name: fullName }).eq('id', profile.id)
      if (error) throw error
      setMessage('Profile updated! ✓')
    } catch (err) {
      setMessage(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <BookLoading text="Loading profile..." />

  // Get initials for avatar
  const initials = (fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-card">
        {/* Avatar with initials */}
        <div className="profile-avatar">{initials}</div>

        {/* Email (read-only) */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} disabled
            style={{ opacity: 0.6 }} />
        </div>

        {/* Full name (editable) */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Full Name</label>
          <input className="form-input" type="text" value={fullName}
            onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
        </div>

        {/* Role badge */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Role</label>
          <div>
            <span className={`badge ${profile?.role === 'admin' ? 'badge-genre' : 'badge-available'}`}>
              {profile?.role || 'customer'}
            </span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem',
            background: message.includes('✓') ? 'var(--green-bg)' : 'var(--red-bg)',
            color: message.includes('✓') ? 'var(--green)' : 'var(--red)',
          }}>
            {message}
          </div>
        )}

        {/* Save button */}
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving && <span className="spinner"></span>}
          Save Changes
        </button>
      </div>
    </div>
  )
}
