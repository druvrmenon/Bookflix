// Browser-side Supabase client
// Used in 'use client' components for auth, database queries, and storage
// Falls back to a mock client during build/prerender when env vars are placeholders

import { createBrowserClient } from '@supabase/ssr' // SSR-compatible browser client

// Create and return a Supabase client for browser use
export function createClient() {
  // Read Supabase credentials from public environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build/prerender, env vars may be placeholder strings
  // Return a mock client that won't crash during static generation
  if (!url || !key || !url.startsWith('http')) {
    return {
      // Mock auth methods — return empty/null safely
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
      },
      // Mock database query builder — chainable methods that return empty data
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }), order: async () => ({ data: [], error: null }), data: [], error: null }),
        insert: async () => ({ error: { message: 'Supabase not configured' } }),
        update: () => ({ eq: async () => ({ error: { message: 'Supabase not configured' } }) }),
        delete: () => ({ eq: async () => ({ error: { message: 'Supabase not configured' } }) }),
      }),
      // Mock storage methods — for file upload/download
      storage: {
        from: () => ({
          upload: async () => ({ error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          remove: async () => ({ error: null }),
        }),
      },
    }
  }

  // Create real Supabase browser client with credentials
  return createBrowserClient(url, key)
}
