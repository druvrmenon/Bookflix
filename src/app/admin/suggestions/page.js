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
          profiles:user_id (full_name)
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
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((suggestion) => (
                <tr key={suggestion.id}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{suggestion.title}</div>
                    {suggestion.additional_info && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Note: {suggestion.additional_info}
                      </div>
                    )}
                  </td>
                  <td>{suggestion.author || '-'}</td>
                  <td>{suggestion.profiles?.full_name || 'Unknown User'}</td>
                  <td>{new Date(suggestion.created_at).toLocaleDateString()}</td>
                  <td>{getStatusBadge(suggestion.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {suggestion.status !== 'approved' && (
                        <button 
                          onClick={() => handleStatusChange(suggestion.id, 'approved')}
                          className="btn btn-sm"
                          style={{ backgroundColor: 'var(--success-color)', color: 'white', border: 'none' }}
                        >
                          Approve
                        </button>
                      )}
                      {suggestion.status !== 'rejected' && (
                        <button 
                          onClick={() => handleStatusChange(suggestion.id, 'rejected')}
                          className="btn btn-sm btn-secondary"
                          style={{ color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
