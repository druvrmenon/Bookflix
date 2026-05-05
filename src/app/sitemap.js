import { createClient } from '@supabase/supabase-js'

// Dynamic sitemap for SEO — auto-lists home, static pages, and all books
export default async function sitemap() {
  const baseUrl = 'https://bookflix.in'

  // Server-side Supabase client (using anon key for public data)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Fetch all books to create dynamic routes for Google
  const { data: books } = await supabase
    .from('books')
    .select('id, created_at')
    .order('created_at', { ascending: false })
  
  const bookUrls = (books || []).map((book) => ({
    url: `${baseUrl}/customer/book/${book.id}`,
    lastModified: new Date(book.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Static site routes
  const staticRoutes = [
    '',
    '/login',
    '/signup',
    '/customer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.7,
  }))

  return [...staticRoutes, ...bookUrls]
}
