'use client'

import { useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminNotificationListener() {
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // 1. Request browser notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    // 2. Subscribe to new rent requests (stable channel — no deps changing)
    const channel = supabase
      .channel('admin-rent-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rent_requests' },
        async (payload) => {
          const { data: requestDetails } = await supabase
            .from('rent_requests')
            .select('contact_name, books(title)')
            .eq('id', payload.new.id)
            .single()

          const title = 'New Rental Request! 📚'
          const body = `${requestDetails?.contact_name || 'Someone'} requested "${requestDetails?.books?.title || 'a book'}"`

          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            new Notification(title, { body, icon: '/logo.png' })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Admin notification channel error — will retry automatically')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase]) // supabase is memoized — this only runs once

  return null
}
