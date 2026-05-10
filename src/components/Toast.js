'use client'

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'

// ─── Context ───────────────────────────────────────────────────────────────
const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const toast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, success: m => toast({ message: m, type: 'success' }), error: m => toast({ message: m, type: 'error' }), info: m => toast({ message: m, type: 'info' }) }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 'calc(24px + env(safe-area-inset-bottom))',
        right: '16px',
        left: '16px',
        maxWidth: '380px',
        marginLeft: 'auto',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Individual Toast ──────────────────────────────────────────────────────
const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
}

const COLORS = {
  success: { bg: 'var(--green-bg)', border: 'rgba(74,222,128,0.3)', color: 'var(--green)' },
  error:   { bg: 'var(--red-bg)',   border: 'rgba(248,113,113,0.3)', color: 'var(--red)' },
  info:    { bg: 'rgba(201,149,108,0.08)', border: 'rgba(201,149,108,0.25)', color: 'var(--rose-gold)' },
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const c = COLORS[toast.type] || COLORS.info

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div
      onClick={onDismiss}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: 'var(--brown-800)',
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.color}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--gray-50)',
        fontSize: '0.9rem',
        cursor: 'pointer',
        pointerEvents: 'all',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <span style={{ color: c.color, flexShrink: 0, marginTop: '1px' }}>{ICONS[toast.type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
    </div>
  )
}
