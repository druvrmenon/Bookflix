import { createClient } from '@supabase/supabase-js'

// Dynamic sitemap — only publicly accessible pages
export default async function sitemap() {
  const baseUrl = 'https://bookflix.in'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Fetch all available books for dynamic routes
  const { data: books } = await supabase
    .from('books')
    .select('id, created_at, title')
    .order('created_at', { ascending: false })

  const bookUrls = (books || []).map((book) => ({
    url: `${baseUrl}/customer/book/${book.id}`,
    lastModified: new Date(book.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Only public, indexable routes — NO /customer, /admin, /reset-password
  const staticRoutes = [
    { route: '', priority: 1.0, freq: 'daily' },
    { route: '/login', priority: 0.5, freq: 'monthly' },
    { route: '/signup', priority: 0.6, freq: 'monthly' },
    { route: '/terms', priority: 0.3, freq: 'yearly' },
  ].map(({ route, priority, freq }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }))

  return [...staticRoutes, ...bookUrls]
}
