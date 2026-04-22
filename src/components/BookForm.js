'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GENRES, LANGUAGES } from '@/lib/constants'

export default function BookForm({ book = null }) {
  const isEditing = !!book
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState(book?.author || '')
  const initialGenres = Array.isArray(book?.genre) 
    ? book.genre 
    : (book?.genre ? [book.genre] : [GENRES[0]])
  const [genre, setGenre] = useState(initialGenres)
  const [language, setLanguage] = useState(book?.language || LANGUAGES[0])

  const toggleGenre = (g) => {
    if (genre.includes(g)) {
      if (genre.length > 1) {
        setGenre(genre.filter(item => item !== g))
      }
    } else {
      setGenre([...genre, g])
    }
  }
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(book?.cover_url || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const uploadCover = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `covers/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('book-covers').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let cover_url = book?.cover_url || null

      if (coverFile) {
        cover_url = await uploadCover(coverFile)
      }

      const bookData = { title, author, genre, language, cover_url }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', book.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('books')
          .insert([bookData])

        if (insertError) throw insertError
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="book-form">
      {error && <div className="auth-error">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="book-title">Title</label>
        <input
          id="book-title"
          className="form-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter book title"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="book-author">Author</label>
        <input
          id="book-author"
          className="form-input"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Enter author name"
          required
        />
      </div>

      <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
        <label className="form-label">Genres</label>
        <div className="filter-bar" style={{ flexWrap: 'wrap', overflowX: 'visible', paddingBottom: '0' }}>
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              className={`filter-chip ${genre.includes(g) ? 'active' : ''}`}
              onClick={() => toggleGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="book-form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="book-language">Language</label>
          <select
            id="book-language"
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Cover Image</label>
        <div className="file-upload">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover preview" className="file-upload-preview" />
          ) : (
            <>
              <div className="file-upload-icon">📷</div>
              <div className="file-upload-text">Click or drag to upload cover image</div>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            aria-label="Upload cover image"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading && <span className="spinner"></span>}
        {isEditing ? 'Update Book' : 'Add Book'}
      </button>
    </form>
  )
}
