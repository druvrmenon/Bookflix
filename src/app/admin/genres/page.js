'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function GenreManagementPage() {
  const supabase = createClient()
  const [genres, setGenres] = useState([])
  const [newGenre, setNewGenre] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from('genres')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      setGenres(data || [])
    } catch (err) {
      console.error('Error fetching genres:', err)
      setError('Failed to load genres')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGenre = async (e) => {
    e.preventDefault()
    if (!newGenre.trim()) return

    setSaving(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('genres')
        .insert([{ name: newGenre.trim() }])
      
      if (insertError) throw insertError

      setNewGenre('')
      fetchGenres()
    } catch (err) {
      setError(err.message || 'Failed to add genre')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGenre = async (id) => {
    if (!confirm('Are you sure you want to delete this genre? Books using this genre will keep the tag, but it won\'t appear in filters.')) return

    try {
      const { error: deleteError } = await supabase
        .from('genres')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      fetchGenres()
    } catch (err) {
      alert('Failed to delete genre: ' + err.message)
    }
  }

  const handleSeedGenres = async () => {
    if (!confirm('This will add the default list of genres. Continue?')) return
    setSaving(true)
    const defaults = [
      'Fiction', 'Non-Fiction', 'Romance', 'Thriller', 'Sci-Fi', 
      'Fantasy', 'Self-Help', 'Biography', 'Academic', 'Teen', 
      'Mythology', 'Manga', 'Mystery', 'Autobiography'
    ]
    
    try {
      // Insert only those that don't exist yet
      const { data: existing } = await supabase.from('genres').select('name')
      const existingNames = existing?.map(e => e.name) || []
      const toAdd = defaults.filter(d => !existingNames.includes(d)).map(name => ({ name }))
      
      if (toAdd.length > 0) {
        const { error } = await supabase.from('genres').insert(toAdd)
        if (error) throw error
      }
      fetchGenres()
    } catch (err) {
      alert('Seed failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-page"><span className="spinner"></span></div>

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', fontSize: '0.9rem' }}>
          ← Back to Dashboard
        </Link>
        <button onClick={handleSeedGenres} className="btn btn-secondary btn-sm" disabled={saving}>
          Seed Initial Genres
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title">Manage Genres</h1>
        <p className="page-subtitle">Add or remove book categories</p>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Add New Genre</h2>
        <form onSubmit={handleAddGenre} style={{ display: 'flex', gap: '10px' }}>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. History, Poetry..."
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            disabled={saving}
          />
          <button type="submit" className="btn btn-primary" disabled={saving || !newGenre.trim()}>
            {saving ? 'Adding...' : 'Add'}
          </button>
        </form>
        {error && <div className="auth-error" style={{ marginTop: '12px' }}>{error}</div>}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((g) => (
              <tr key={g.id}>
                <td style={{ fontWeight: 600, color: 'var(--gray-50)' }}>{g.name}</td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDeleteGenre(g.id)}
                    className="btn btn-sm btn-danger"
                    style={{ padding: '6px 12px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {genres.length === 0 && (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  No genres found. Add your first one above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="admin-card-list">
        {genres.map((g) => (
          <div key={g.id} className="card admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">{g.name}</span>
              <button 
                onClick={() => handleDeleteGenre(g.id)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
