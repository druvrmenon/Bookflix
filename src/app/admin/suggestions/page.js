'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      // Note: In a real app we'd likely join with profiles table to get the user's name
      // but for simplicity we'll just show the user_id or handle it via a view.
      // Here we assume admins can just see all.
      
      const { data, error: fetchError } = await supabase
        .from('book_suggestions')
        .select(`
          *,
          profiles (full_name)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setSuggestions(data || [])
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setError('Failed to load suggestions.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('book_suggestions')
        .update({ status: newStatus })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state to reflect change without refetching everything
      setSuggestions(suggestions.map(s => 
        s.id === id ? { ...s, status: newStatus } : s
      ))
      
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update suggestion status.')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge" style={{ backgroundColor: 'var(--success-color)' }}>Approved</span>
      case 'rejected':
        return <span className="badge" style={{ backgroundColor: 'var(--error-color)' }}>Rejected</span>
      default:
        return <span className="badge" style={{ backgroundColor: 'var(--accent-color)' }}>Pending</span>
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-page-title">Manage Book Suggestions</h1>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--error-color)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading suggestions...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="admin-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No book suggestions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ paddingRight: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', color: 'var(--text)' }}>{suggestion.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    by {suggestion.author || 'Unknown'} {suggestion.genre && <span style={{ color: 'var(--rose-gold)', marginLeft: '0.5rem' }}>• {suggestion.genre}</span>}
                  </p>
                </div>
                <div>{getStatusBadge(suggestion.status)}</div>
              </div>

              <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                {suggestion.additional_info && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>Note:</strong> {suggestion.additional_info}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  <p style={{ margin: '0 0 0.25rem 0' }}>Requested by: <span style={{ color: 'var(--text-muted)' }}>{suggestion.profiles?.full_name || 'Unknown User'}</span></p>
                  <p style={{ margin: 0 }}>Date: {new Date(suggestion.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(201, 149, 108, 0.1)' }}>
                {suggestion.status !== 'approved' && (
                  <button 
                    onClick={() => handleStatusChange(suggestion.id, 'approved')}
                    className="btn btn-sm"
                    style={{ flex: 1, backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--green)', border: '1px solid rgba(74, 222, 128, 0.3)' }}
                  >
                    Approve
                  </button>
                )}
                {suggestion.status !== 'rejected' && (
                  <button 
                    onClick={() => handleStatusChange(suggestion.id, 'rejected')}
                    className="btn btn-sm btn-danger"
                    style={{ flex: 1 }}
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
