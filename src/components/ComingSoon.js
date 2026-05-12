'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import confetti from 'canvas-confetti'

const TimeUnit = ({ value, label }) => (
  <div className="countdown-unit">
    <div className="countdown-value">{value.toString().padStart(2, '0')}</div>
    <div className="countdown-label">{label}</div>
  </div>
)

export default function ComingSoon({ targetDate, showSignOut = false }) {
  const router = useRouter()
  const supabase = createClient()
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [hasFinished, setHasFinished] = useState(false)
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    // Only run confetti and redirect once
    if (hasFinished && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;

      // Start confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
      }, 250);

      // Redirect after confetti
      setTimeout(() => {
        window.location.href = '/';
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [hasFinished]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setHasFinished(true)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="coming-soon-overlay">
      <div className="coming-soon-content">
        <div className="loading-logo-wrap" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
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

        {showSignOut && (
          <div style={{ marginTop: '32px' }}>
            <button onClick={handleSignOut} className="btn btn-secondary btn-sm" style={{ opacity: 0.7 }}>
              Sign Out
            </button>
          </div>
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
        @keyframes csSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
