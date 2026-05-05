'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PresenceTracker() {
  const pathname = usePathname()
  const supabase = createClient()
  const channelRef = useRef(null)

  useEffect(() => {
    let mounted = true

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return

      // Fetch profile info if logged in
      let profile = null
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()
        profile = data
      }

      const userDisplayName = profile?.full_name || (user ? user.email.split('@')[0] : 'Guest')
      const userRole = profile?.role || 'visitor'

      // Join the global presence channel
      const channel = supabase.channel('global-presence', {
        config: {
          presence: {
            key: user?.id || `anon-${Math.random().toString(36).substring(7)}`,
          },
        },
      })

      channelRef.current = channel

      channel
        .on('presence', { event: 'sync' }, () => {
          // We don't necessarily need to do anything on sync in the tracker
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user?.id || null,
              name: userDisplayName,
              role: userRole,
              online_at: new Date().toISOString(),
              current_page: pathname,
            })
          }
        })
    }

    setupPresence()

    return () => {
      mounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [supabase, pathname]) // Re-track on pathname change

  return null // This component doesn't render anything
}
