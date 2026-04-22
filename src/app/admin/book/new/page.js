import BookForm from '@/components/BookForm'
import Link from 'next/link'

export const metadata = {
  title: 'Add Book — BookFlix Admin',
}

export default function NewBookPage() {
  return (
    <div className="fade-in">
      <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', marginBottom: '20px', fontSize: '0.9rem' }}>
        ← Back to Dashboard
      </Link>
      <div className="page-header">
        <h1 className="page-title">Add New Book</h1>
        <p className="page-subtitle">Fill in the details to add a book to the catalog</p>
      </div>
      <BookForm />
    </div>
  )
}
