'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminNotificationListener() {
  const supabase = createClient()

  useEffect(() => {
    // 1. Request Browser Notification Permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }

    // 2. Subscribe to new rent requests
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rent_requests',
        },
        async (payload) => {
          console.log('New rent request received!', payload)
          
          // Fetch additional data (book title and requester name)
          const { data: requestDetails } = await supabase
            .from('rent_requests')
            .select(`
              contact_name,
              books (title)
            `)
            .eq('id', payload.new.id)
            .single()

          const title = 'New Rental Request! 📚'
          const body = `${requestDetails?.contact_name || 'Someone'} requested "${requestDetails?.books?.title || 'a book'}"`

          // Show Browser Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
              body,
              icon: '/logo.png',
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return null
}
