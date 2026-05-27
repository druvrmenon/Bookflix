import { createClient } from '@supabase/supabase-js'
import BookDetailClient from './BookDetailClient'
import { notFound } from 'next/navigation'

// Initialize Supabase (Server Side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// 1. DYNAMIC METADATA — This makes Google show the real book title
export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: book } = await supabase
    .from('books')
    .select('title, author, description, cover_url')
    .eq('id', id)
    .single()

  if (!book) return { title: 'Book Not Found | BookFlix' }

  return {
    title: `${book.title} by ${book.author} | Rent on BookFlix`,
    description: book.description || `Rent ${book.title} by ${book.author} on BookFlix. Malayalam and English books available.`,
    robots: { index: true, follow: true },
    openGraph: {
      title: `${book.title} by ${book.author}`,
      description: book.description,
      images: [book.cover_url || '/og-image.png'],
    },
  }
}

// 2. SERVER COMPONENT — Fetches data before rendering
export default async function BookPage({ params }) {
  const { id } = await params

  // Fetch book data
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  if (!book) notFound()

  // 3. PRODUCT SCHEMA (JSON-LD) — Makes Google show Price and Availability
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    description: book.description,
    image: book.cover_url,
    offers: {
      '@type': 'Offer',
      price: '70.00',
      priceCurrency: 'INR',
      availability: book.available 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `https://bookflix.in/customer/book/${id}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookDetailClient initialBook={book} id={id} />
    </>
  )
}
