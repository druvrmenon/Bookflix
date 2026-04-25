// BookForm component — admin form for adding/editing books
// Supports: front cover + back cover upload, image crop, multi-genre, description
'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GENRES, LANGUAGES } from '@/lib/constants'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function BookForm({ book = null }) {
  const isEditing = !!book
  const router = useRouter()
  const supabase = createClient()

  // Form fields
  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState(book?.author || '')
  const [description, setDescription] = useState(book?.description || '')
  const initialGenres = Array.isArray(book?.genre)
    ? book.genre
    : (book?.genre ? [book.genre] : [GENRES[0]])
  const [genre, setGenre] = useState(initialGenres)
  const [language, setLanguage] = useState(book?.language || LANGUAGES[0])

  // Toggle genre selection (min 1 required)
  const toggleGenre = (g) => {
    if (genre.includes(g)) {
      if (genre.length > 1) setGenre(genre.filter(item => item !== g))
    } else {
      setGenre([...genre, g])
    }
  }

  // Front cover states
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(book?.cover_url || null)
  const [coverIsExternal, setCoverIsExternal] = useState(false)

  // Back cover states
  const [backCoverFile, setBackCoverFile] = useState(null)
  const [backCoverPreview, setBackCoverPreview] = useState(book?.back_cover_url || null)

  // Image crop states
  const [cropImage, setCropImage] = useState(null)
  const [crop, setCrop] = useState(undefined)
  const [cropTarget, setCropTarget] = useState(null)
  const imgRef = useRef(null)

  // Google Books search states
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchGoogleBooks = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=12`)
      const data = await res.json()
      const books = (data.items || []).filter(b => b.volumeInfo?.imageLinks?.thumbnail)
      setSearchResults(books)
    } catch (err) {
      console.error('Google Books search failed:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const pickSearchCover = (url) => {
    // Google gives http thumbnails, upgrade to https and get bigger image
    const hdUrl = url.replace('http://', 'https://').replace('zoom=1', 'zoom=3')
    setCoverPreview(hdUrl)
    setCoverFile(null)
    setCoverIsExternal(true)
    setSearchOpen(false)
    setSearchResults([])
    setSearchQuery('')
  }

  // Handle file selection — opens crop modal
  const handleFileChange = (e, target) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setCropImage(reader.result) // Set image data for crop UI
        setCropTarget(target) // Remember which cover we're cropping
        setCrop(undefined) // Reset crop selection
      }
      reader.readAsDataURL(file)
    }
  }

  // Convert crop to canvas blob
  const getCroppedBlob = useCallback(() => {
    return new Promise((resolve) => {
      const image = imgRef.current
      if (!image || !crop?.width || !crop?.height) {
        // No crop selected — use full image
        fetch(cropImage)
          .then(r => r.blob())
          .then(resolve)
        return
      }

      const canvas = document.createElement('canvas')
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      canvas.width = crop.width * scaleX
      canvas.height = crop.height * scaleY

      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0, 0,
        canvas.width,
        canvas.height
      )

      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    })
  }, [crop, cropImage])

  // Confirm crop — save blob and preview
  const handleCropConfirm = async () => {
    const blob = await getCroppedBlob()
    const previewUrl = URL.createObjectURL(blob)
    const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' })

    if (cropTarget === 'front') {
      setCoverFile(file)
      setCoverPreview(previewUrl)
    } else {
      setBackCoverFile(file)
      setBackCoverPreview(previewUrl)
    }

    setCropImage(null) // Close crop modal
    setCropTarget(null)
  }

  // Upload image to Supabase Storage
  const uploadCover = async (file, prefix = '') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `covers/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('book-covers').getPublicUrl(filePath)
    return data.publicUrl
  }

  // Form submit — upload covers and save book
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let cover_url = book?.cover_url || null
      let back_cover_url = book?.back_cover_url || null

      if (coverFile) {
        cover_url = await uploadCover(coverFile, 'front-')
      } else if (coverIsExternal && coverPreview) {
        cover_url = coverPreview
      }

      // Upload back cover if new file selected
      if (backCoverFile) {
        back_cover_url = await uploadCover(backCoverFile, 'back-')
      }

      const bookData = { title, author, description, genre, language, cover_url, back_cover_url }

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
    <>
      <form onSubmit={handleSubmit} className="book-form">
        {error && <div className="auth-error">{error}</div>}

        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="book-title">Title</label>
          <input id="book-title" className="form-input" type="text" value={title}
            onChange={(e) => setTitle(e.target.value)} placeholder="Enter book title" required />
        </div>

        {/* Author */}
        <div className="form-group">
          <label className="form-label" htmlFor="book-author">Author</label>
          <input id="book-author" className="form-input" type="text" value={author}
            onChange={(e) => setAuthor(e.target.value)} placeholder="Enter author name" required />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="book-desc">Description</label>
          <textarea id="book-desc" className="form-textarea" value={description}
            onChange={(e) => setDescription(e.target.value)} placeholder="Book summary or description (optional)"
            rows={3} />
        </div>

        {/* Genre chips */}
        <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
          <label className="form-label">Genres</label>
          <div className="filter-bar" style={{ flexWrap: 'wrap', overflowX: 'visible', paddingBottom: '0' }}>
            {GENRES.map((g) => (
              <button key={g} type="button"
                className={`filter-chip ${genre.includes(g) ? 'active' : ''}`}
                onClick={() => toggleGenre(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="book-form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="book-language">Language</label>
            <select id="book-language" className="form-select" value={language}
              onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (<option key={l} value={l}>{l}</option>))}
            </select>
          </div>
        </div>

        {/* Cover uploads — front and back side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Front cover */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>Front Cover</label>
              <button type="button" className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', minHeight: '30px', padding: '4px 10px' }}
                onClick={() => { setSearchQuery(title); setSearchOpen(true) }}>
                🔍 Search Cover
              </button>
            </div>
            <div className="file-upload">
              {coverPreview ? (
                <img src={coverPreview} alt="Front cover" className="file-upload-preview" />
              ) : (
                <>
                  <div className="file-upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </div>
                  <div className="file-upload-text">Front cover</div>
                </>
              )}
              <input type="file" accept="image/*" onChange={(e) => { handleFileChange(e, 'front'); setCoverIsExternal(false) }}
                aria-label="Upload front cover" />
            </div>
          </div>

          {/* Back cover */}
          <div className="form-group">
            <label className="form-label">Back Cover</label>
            <div className="file-upload">
              {backCoverPreview ? (
                <img src={backCoverPreview} alt="Back cover" className="file-upload-preview" />
              ) : (
                <>
                  <div className="file-upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </div>
                  <div className="file-upload-text">Back cover</div>
                </>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'back')}
                aria-label="Upload back cover" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="spinner"></span>}
          {isEditing ? 'Update Book' : 'Add Book'}
        </button>
      </form>

      {/* Image crop modal */}
      {cropImage && (
        <div className="crop-modal">
          <h3 style={{ color: 'var(--gray-50)', marginBottom: '16px' }}>
            Crop {cropTarget === 'front' ? 'Front' : 'Back'} Cover
          </h3>
          <div className="crop-container">
            <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={2 / 3}>
              <img ref={imgRef} src={cropImage} alt="Crop preview"
                style={{ maxHeight: '60vh', maxWidth: '80vw' }} />
            </ReactCrop>
          </div>
          <div className="crop-actions">
            <button className="btn btn-secondary" onClick={() => { setCropImage(null); setCropTarget(null); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCropConfirm}>
              Apply Crop
            </button>
          </div>
        </div>
      )}

      {/* Google Books cover search modal */}
      {searchOpen && (
        <div className="crop-modal" onClick={() => setSearchOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--brown-800)', borderRadius: 'var(--radius-xl)', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: 'var(--gray-50)', marginBottom: '16px' }}>Search Book Cover</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                className="form-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchGoogleBooks()}
                placeholder="Search by title or author..."
                autoFocus
              />
              <button type="button" className="btn btn-primary" onClick={searchGoogleBooks} disabled={searching}
                style={{ whiteSpace: 'nowrap' }}>
                {searching ? '...' : 'Search'}
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {searchResults.length === 0 && !searching && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                  {searchQuery ? 'No results. Try different keywords.' : 'Type a title and hit Search.'}
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                {searchResults.map((item) => {
                  const thumb = item.volumeInfo.imageLinks.thumbnail
                  return (
                    <div key={item.id}
                      onClick={() => pickSearchCover(thumb)}
                      style={{ cursor: 'pointer', borderRadius: 'var(--radius)', overflow: 'hidden', border: '2px solid transparent', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--rose-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <img src={thumb.replace('http://', 'https://')} alt={item.volumeInfo.title}
                        style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.volumeInfo.title}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSearchOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
