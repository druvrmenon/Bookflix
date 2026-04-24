'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CustomerSuggestionsPage() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('book_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setSuggestions(data || [])
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setError('Failed to load your suggestions.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('book_suggestions')
        .insert({
          user_id: user.id,
          title: title.trim(),
          author: author.trim() || null,
          genre: genre.trim() || null,
          additional_info: additionalInfo.trim() || null
        })

      if (insertError) throw insertError

      // Clear form and refresh list
      setTitle('')
      setAuthor('')
      setGenre('')
      setAdditionalInfo('')
      await fetchSuggestions()

    } catch (err) {
      console.error('Error submitting suggestion:', err)
      setError('Failed to submit suggestion.')
    } finally {
      setSubmitting(false)
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
    <div className="fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Suggest a Book</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Can't find what you're looking for? Let us know what books we should add to our catalog!
      </p>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--error-color)' }}>
          {error}
        </div>
      )}

      <div className="auth-card" style={{ marginBottom: '3rem', width: '100%' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">Book Title *</label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., The Midnight Library"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="author" className="form-label">Author (Optional)</label>
            <input
              id="author"
              type="text"
              className="form-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="E.g., Matt Haig"
            />
          </div>

          <div className="form-group">
            <label htmlFor="genre" className="form-label">Genre (Optional)</label>
            <input
              id="genre"
              type="text"
              className="form-input"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="E.g., Science Fiction, Fantasy"
            />
          </div>

          <div className="form-group">
            <label htmlFor="info" className="form-label">Additional Info (Optional)</label>
            <textarea
              id="info"
              className="form-input"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Why should we add this book? Specific edition, series, etc."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Your Past Suggestions</h2>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading your suggestions...</p>
      ) : suggestions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't made any suggestions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{suggestion.title}</h3>
                {suggestion.author && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>by {suggestion.author}</p>}
                {suggestion.genre && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Genre: {suggestion.genre}</p>}
                {suggestion.additional_info && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Note: {suggestion.additional_info}</p>}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Suggested on {new Date(suggestion.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                {getStatusBadge(suggestion.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
