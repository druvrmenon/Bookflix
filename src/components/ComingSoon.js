'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const TimeUnit = ({ value, label }) => (
  <div className="countdown-unit">
    <div className="countdown-value">{value.toString().padStart(2, '0')}</div>
    <div className="countdown-label">{label}</div>
  </div>
)

export default function ComingSoon({ targetDate, showSignOut = false }) {
  const supabase = createClient()
  const targetMs = new Date(targetDate).getTime()

  // Initialize with actual remaining time (not zeros)
  const getTimeLeft = useCallback(() => {
    const diff = targetMs - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    }
  }, [targetMs])

  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const [isLive, setIsLive] = useState(() => Date.now() >= targetMs)
  const confettiDoneRef = useRef(false)

  // Countdown timer
  useEffect(() => {
    if (isLive) return // Already live, no need to count

    const timer = setInterval(() => {
      const diff = targetMs - Date.now()
      if (diff <= 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsLive(true)
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetMs, isLive])

  // Confetti — fires once when isLive becomes true
  useEffect(() => {
    if (!isLive || confettiDoneRef.current) return
    confettiDoneRef.current = true

    import('canvas-confetti').then((mod) => {
      const confetti = mod.default
      const duration = 4000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 }
      const rand = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const remaining = animationEnd - Date.now()
        if (remaining <= 0) {
          clearInterval(interval)
          // Auto-refresh the page so the server serves the real app without the user having to click anything
          setTimeout(() => {
            window.location.reload()
          }, 1000)
          return
        }
        const particleCount = 60 * (remaining / duration)
        confetti({ ...defaults, particleCount, origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)
    })

    // No automatic reload — user clicks a button to navigate
  }, [isLive])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="coming-soon-overlay">
      <div className="coming-soon-content">
        <div className="loading-logo-wrap" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <Image src="/logo.png" alt="BookFlix" width={180} height={60} priority />
        </div>

        {isLive ? (
          /* —— We're Live state —— */
          <div className="cs-live-state">
            <div className="cs-live-badge">🎉 We&apos;re Live!</div>
            <h1 className="coming-soon-title" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)' }}>
              BookFlix is Now Open!
            </h1>
            <p className="coming-soon-subtitle">
              The wait is over — welcome to your curated book rental platform.
            </p>
            {showSignOut ? (
              /* Authenticated user (on /customer) */
              <a href="/customer" className="btn btn-primary">
                Enter BookFlix →
              </a>
            ) : (
              /* Unauthenticated user (on / or /signup) */
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/signup" className="btn btn-primary">
                  Sign Up
                </a>
                <a href="/login" className="btn btn-secondary">
                  Sign In
                </a>
              </div>
            )}
          </div>
        ) : (
          /* —— Countdown state —— */
          <>
            <h1 className="coming-soon-title">Exciting Things Coming Soon</h1>
            <p className="coming-soon-subtitle">
              We&apos;re preparing something special for our readers.
              Stay tuned, the wait is almost over!
            </p>

            <div className="countdown-grid">
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Minutes" />
              <TimeUnit value={timeLeft.seconds} label="Seconds" />
            </div>

            <div className="coming-soon-footer">
              May 12, 2026 • 11:11 AM
            </div>

            {showSignOut && (
              <div style={{ marginTop: '32px' }}>
                <button onClick={handleSignOut} className="btn btn-secondary btn-sm" style={{ opacity: 0.7 }}>
                  Sign Out
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .coming-soon-overlay {
          position: fixed;
          inset: 0;
          background: var(--bg);
          background: radial-gradient(circle at center, var(--brown-800) 0%, var(--bg) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 32px 24px;
          text-align: center;
          overflow-y: auto;
        }
        @media (max-height: 700px) {
          .coming-soon-overlay { justify-content: flex-start; }
        }
        .coming-soon-content {
          max-width: 600px;
          width: 100%;
          animation: csSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 20px 0;
        }
        .coming-soon-title {
          font-size: clamp(1.75rem, 8vw, 3rem);
          margin-bottom: 12px;
          background: linear-gradient(135deg, var(--gray-50), var(--rose-gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .coming-soon-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 32px;
          line-height: 1.5;
        }
        @media (max-width: 480px) {
          .coming-soon-subtitle { font-size: 0.9rem; margin-bottom: 24px; }
        }
        .countdown-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        @media (max-width: 480px) {
          .countdown-grid { gap: 8px; margin-bottom: 24px; }
        }
        .countdown-unit {
          background: var(--bg-card);
          border: 1px solid rgba(201, 149, 108, 0.2);
          border-radius: var(--radius-lg);
          padding: 16px 8px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.3s ease;
        }
        .countdown-unit:hover { transform: translateY(-4px); border-color: var(--rose-gold); }
        .countdown-value {
          font-family: var(--font-outfit), sans-serif;
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          font-weight: 800;
          color: var(--rose-gold);
          line-height: 1;
          margin-bottom: 4px;
        }
        .countdown-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-dim);
          font-weight: 600;
        }
        .coming-soon-footer {
          font-size: 0.9rem;
          color: var(--rose-gold);
          letter-spacing: 0.2em;
          opacity: 0.8;
          text-transform: uppercase;
        }
        /* Live state */
        .cs-live-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .cs-live-badge {
          display: inline-block;
          background: linear-gradient(135deg, var(--rose-gold), #e8b89a);
          color: var(--bg);
          font-weight: 700;
          font-size: 1.1rem;
          padding: 10px 24px;
          border-radius: 999px;
          letter-spacing: 0.05em;
          animation: livePulse 1.5s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201, 149, 108, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(201, 149, 108, 0); }
        }
        @keyframes csSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
