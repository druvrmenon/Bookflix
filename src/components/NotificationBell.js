'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Realtime listener for new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        const newNotif = payload.new
        // Only show if it's for ALL users or THIS user
        if (newNotif.user_id === null || newNotif.user_id === user.id) {
          setNotifications(prev => [newNotif, ...prev])
          setUnreadCount(c => c + 1)
        }
      })
      .subscribe()

    // Close on outside click
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
  }, [user])

  const fetchNotifications = async () => {
    // Fetch global and specific notifications
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

    // Process and calculate unread
    let unread = 0
    const processed = notifs.map(n => {
      let read = false
      if (n.user_id === null) {
        read = readGlobals.includes(n.id)
      } else {
        read = n.is_read
      }
      if (!read) unread++
      return { ...n, isRead: read }
    })

    setNotifications(processed)
    setUnreadCount(unread)
  }

  const markAsRead = async (notification) => {
    if (notification.isRead) return

    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))

    if (notification.user_id === null) {
      // Global notification
      await supabase.from('notification_reads').insert({
        notification_id: notification.id,
        user_id: user.id
      })
    } else {
      // Specific notification
      await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="notification-bell-btn" 
        onClick={toggleDropdown}
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
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No new announcements.</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                  onMouseEnter={() => markAsRead(n)}
                >
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-message">{n.message}</div>
                  <div className="notification-time">{new Date(n.created_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
