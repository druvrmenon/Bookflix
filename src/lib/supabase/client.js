import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build/prerender, env vars may be placeholders
  if (!url || !key || !url.startsWith('http')) {
    // Return a mock client that won't crash during SSR prerender
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }), order: async () => ({ data: [], error: null }), data: [], error: null }),
        insert: async () => ({ error: { message: 'Supabase not configured' } }),
        update: () => ({ eq: async () => ({ error: { message: 'Supabase not configured' } }) }),
        delete: () => ({ eq: async () => ({ error: { message: 'Supabase not configured' } }) }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          remove: async () => ({ error: null }),
        }),
      },
    }
  }

  return createBrowserClient(url, key)
}
