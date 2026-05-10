'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function ComingSoon({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const TimeUnit = ({ value, label }) => (
    <div className="countdown-unit">
      <div className="countdown-value">{value.toString().padStart(2, '0')}</div>
      <div className="countdown-label">{label}</div>
    </div>
  )

  return (
    <div className="coming-soon-overlay">
      <div className="coming-soon-content">
        <div className="loading-logo-wrap" style={{ marginBottom: '32px' }}>
          <Image src="/logo.png" alt="BookFlix" width={180} height={60} priority />
        </div>
        
        <h1 className="coming-soon-title">Exciting Things Coming Soon</h1>
        <p className="coming-soon-subtitle">
          We're preparing something special for our readers.
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
      </div>

      <style jsx>{`
        .coming-soon-overlay {
          position: fixed;
          inset: 0;
          background: var(--bg);
          background: radial-gradient(circle at center, var(--brown-800) 0%, var(--bg) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 24px;
          text-align: center;
        }

        .coming-soon-content {
          max-width: 600px;
          width: 100%;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .coming-soon-title {
          font-size: clamp(2rem, 8vw, 3rem);
          margin-bottom: 16px;
          background: linear-gradient(135deg, var(--gray-50), var(--rose-gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .coming-soon-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
          margin-bottom: 48px;
          line-height: 1.6;
        }

        .countdown-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 48px;
        }

        @media (max-width: 480px) {
          .countdown-grid {
            gap: 8px;
          }
        }

        :global(.countdown-unit) {
          background: var(--bg-card);
          border: 1px solid rgba(201, 149, 108, 0.2);
          border-radius: var(--radius-lg);
          padding: 16px 8px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.3s ease;
        }

        :global(.countdown-unit:hover) {
          transform: translateY(-4px);
          border-color: var(--rose-gold);
        }

        :global(.countdown-value) {
          font-family: var(--font-outfit), sans-serif;
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          font-weight: 800;
          color: var(--rose-gold);
          line-height: 1;
          margin-bottom: 4px;
        }

        :global(.countdown-label) {
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

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
