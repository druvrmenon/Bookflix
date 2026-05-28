'use client'
// ChatbaseIdentity — identifies logged-in user with Chatbase chatbot
// Fetches a signed JWT from server, passes to window.chatbase('identify')
// Runs once after page loads; silently skips if user is not logged in

import { useEffect } from 'react'

export default function ChatbaseIdentity() {
  useEffect(() => {
    async function identifyUser() {
      try {
        const res = await fetch('/api/chatbase-token')
        const { token } = await res.json()

        // No token = guest user, skip identify
        if (!token) return

        // Wait for chatbase to be ready
        const tryIdentify = () => {
          if (typeof window !== 'undefined' && typeof window.chatbase === 'function') {
            window.chatbase('identify', { token })
          } else {
            // Retry after 500ms if chatbase not ready yet
            setTimeout(tryIdentify, 500)
          }
        }

        tryIdentify()
      } catch {
        // Silent fail — chatbot still works, just anonymous
      }
    }

    identifyUser()
  }, [])

  return null
}
