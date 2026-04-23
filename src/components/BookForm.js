// BookForm component — admin form for adding/editing books
// Handles cover image upload to Supabase Storage
// Supports multi-genre selection via clickable chips
'use client' // Client component — handles form state, file uploads, and navigation

import { useState } from 'react' // React state hook
import { useRouter } from 'next/navigation' // Next.js router for redirect after submit
import { createClient } from '@/lib/supabase/client' // Browser Supabase client
import { GENRES, LANGUAGES } from '@/lib/constants' // Available genres and languages

// BookForm — pass `book` prop when editing, omit when creating new
export default function BookForm({ book = null }) {
  // Determine if we're editing an existing book or creating new
  const isEditing = !!book
  const router = useRouter() // Router for redirecting after save
  const supabase = createClient() // Supabase client for database and storage

  // Form field states — pre-filled with book data when editing
  const [title, setTitle] = useState(book?.title || '') // Book title
  const [author, setAuthor] = useState(book?.author || '') // Author name

  // Initialize genres — handle array, string, or empty cases
  const initialGenres = Array.isArray(book?.genre)
    ? book.genre // Already an array
    : (book?.genre ? [book.genre] : [GENRES[0]]) // Convert string to array or default
  const [genre, setGenre] = useState(initialGenres) // Selected genres (array)
  const [language, setLanguage] = useState(book?.language || LANGUAGES[0]) // Selected language

  // Toggle a genre on/off in the selection
  // Prevents deselecting all genres (minimum 1 required)
  const toggleGenre = (g) => {
    if (genre.includes(g)) {
      // Only remove if at least 1 genre will remain
      if (genre.length > 1) {
        setGenre(genre.filter(item => item !== g)) // Remove genre
      }
    } else {
      setGenre([...genre, g]) // Add genre
    }
  }

  const [coverFile, setCoverFile] = useState(null) // Selected file for upload
  const [coverPreview, setCoverPreview] = useState(book?.cover_url || null) // Preview URL
  const [loading, setLoading] = useState(false) // Submit loading state
  const [error, setError] = useState('') // Error message string

  // Handle file input change — store file and create preview URL
  const handleFileChange = (e) => {
    const file = e.target.files[0] // Get first selected file
    if (file) {
      setCoverFile(file) // Store file for upload on submit
      setCoverPreview(URL.createObjectURL(file)) // Create local preview URL
    }
  }

  // Upload cover image to Supabase Storage bucket "book-covers"
  // Returns the public URL of the uploaded image
  const uploadCover = async (file) => {
    // Generate unique filename using timestamp + random string
    const fileExt = file.name.split('.').pop() // Get file extension
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `covers/${fileName}` // Storage path

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('book-covers') // Target bucket
      .upload(filePath, file) // Upload file

    if (uploadError) throw uploadError // Throw if upload fails

    // Get the public URL for the uploaded file
    const { data } = supabase.storage.from('book-covers').getPublicUrl(filePath)
    return data.publicUrl // Return URL to store in database
  }

  // Form submit handler — upload cover (if new) and save book to database
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent default form submission (page reload)
    setLoading(true) // Show loading spinner
    setError('') // Clear previous errors

    try {
      // Start with existing cover URL (or null for new books)
      let cover_url = book?.cover_url || null

      // If user selected a new cover image, upload it first
      if (coverFile) {
        cover_url = await uploadCover(coverFile) // Upload and get URL
      }

      // Build book data object for database
      const bookData = { title, author, genre, language, cover_url }

      if (isEditing) {
        // UPDATE existing book row by ID
        const { error: updateError } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', book.id) // Match by book ID

        if (updateError) throw updateError
      } else {
        // INSERT new book row
        const { error: insertError } = await supabase
          .from('books')
          .insert([bookData]) // Insert single row

        if (insertError) throw insertError
      }

      // Redirect to admin dashboard after successful save
      router.push('/admin')
      router.refresh() // Refresh server data to show the new/updated book
    } catch (err) {
      setError(err.message || 'Something went wrong') // Show error message
    } finally {
      setLoading(false) // Hide loading spinner
    }
  }

  return (
    // Book form — triggers handleSubmit on submit
    <form onSubmit={handleSubmit} className="book-form">
      {/* Show error message if any */}
      {error && <div className="auth-error">{error}</div>}

      {/* Title input field */}
      <div className="form-group">
        <label className="form-label" htmlFor="book-title">Title</label>
        <input
          id="book-title"
          className="form-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter book title"
          required // HTML5 validation — must be filled
        />
      </div>

      {/* Author input field */}
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

      {/* Genre multi-select chips — click to toggle on/off */}
      <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
        <label className="form-label">Genres</label>
        {/* Wrapping filter bar for genre chips */}
        <div className="filter-bar" style={{ flexWrap: 'wrap', overflowX: 'visible', paddingBottom: '0' }}>
          {GENRES.map((g) => (
            <button
              key={g}
              type="button" // Prevent form submission on click
              className={`filter-chip ${genre.includes(g) ? 'active' : ''}`} // Highlight selected
              onClick={() => toggleGenre(g)} // Toggle genre selection
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Language dropdown selector */}
      <div className="book-form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="book-language">Language</label>
          <select
            id="book-language"
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)} // Update language state
          >
            {/* Render one option per language */}
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cover image upload area */}
      <div className="form-group">
        <label className="form-label">Cover Image</label>
        <div className="file-upload">
          {coverPreview ? (
            // Show preview of selected/existing cover image
            <img src={coverPreview} alt="Cover preview" className="file-upload-preview" />
          ) : (
            // Show upload prompt when no image selected
            <>
              <div className="file-upload-icon">📷</div>
              <div className="file-upload-text">Click or drag to upload cover image</div>
            </>
          )}
          {/* Hidden file input — triggered by clicking the upload area */}
          <input
            type="file"
            accept="image/*" // Only allow image files
            onChange={handleFileChange} // Handle file selection
            aria-label="Upload cover image"
          />
        </div>
      </div>

      {/* Submit button — shows spinner when loading */}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading && <span className="spinner"></span>}
        {isEditing ? 'Update Book' : 'Add Book'}
      </button>
    </form>
  )
}
