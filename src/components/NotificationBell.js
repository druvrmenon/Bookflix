'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const dropdownRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!notifs) return

    // Fetch read states for global notifications
    const globalIds = notifs.filter(n => n.user_id === null).map(n => n.id)
    let readGlobals = []
    if (globalIds.length > 0) {
      const { data: reads } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id)
        .in('notification_id', globalIds)
      if (reads) readGlobals = reads.map(r => r.notification_id)
    }

    let unread = 0
    const processed = notifs.map(n => {
      const read = n.user_id === null ? readGlobals.includes(n.id) : !!n.is_read
      if (!read) unread++
      return { ...n, isRead: read }
    })

    setNotifications(processed)
    setUnreadCount(unread)
  }, [supabase, user])

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Realtime: new notification inserted
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        const newNotif = payload.new
        // Only show if for ALL users or THIS user
        if (newNotif.user_id === null || newNotif.user_id === user.id) {
          // Always mark realtime-pushed notifications as unread
          setNotifications(prev => [{ ...newNotif, isRead: false }, ...prev])
          setUnreadCount(c => c + 1)
        }
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Notification channel error')
        }
      })

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [user, supabase, fetchNotifications])

  const markAsRead = async (notification) => {
    if (notification.isRead) return

    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))

    if (notification.user_id === null) {
      await supabase.from('notification_reads').insert({
        notification_id: notification.id,
        user_id: user.id
      })
    } else {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id)
    }
  }

  const clearAll = async () => {
    const unread = notifications.filter(n => !n.isRead)
    if (unread.length === 0) return

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)

    const globalUnread = unread.filter(n => n.user_id === null)
    const personalUnread = unread.filter(n => n.user_id !== null)

    if (globalUnread.length > 0) {
      await supabase.from('notification_reads').insert(
        globalUnread.map(n => ({ notification_id: n.id, user_id: user.id }))
      )
    }
    if (personalUnread.length > 0) {
      await supabase.from('notifications')
        .update({ is_read: true })
        .in('id', personalUnread.map(n => n.id))
    }
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setIsOpen(o => !o)}
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Announcements</h4>
            {unreadCount > 0 && (
              <button
                onClick={clearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--rose-gold)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  opacity: 0.85,
                }}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No announcements yet.</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                  onMouseEnter={() => markAsRead(n)}
                >
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-message">{n.message}</div>
                  <div className="notification-time">{new Date(n.created_at).toLocaleDateString('en-IN')}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
