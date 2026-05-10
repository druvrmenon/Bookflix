import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: '404 — Page Not Found | BookFlix',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(201, 149, 108, 0.06) 0%, transparent 60%)',
    }}>
      <div style={{ marginBottom: '32px', animation: 'logoPulse 1.8s ease-in-out infinite' }}>
        <Image src="/logo.png" alt="BookFlix" width={160} height={54} priority />
      </div>

      <div style={{
        fontSize: 'clamp(5rem, 20vw, 9rem)',
        fontWeight: 800,
        lineHeight: 1,
        background: 'linear-gradient(135deg, var(--rose-gold), rgba(201,149,108,0.3))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '16px',
        fontFamily: 'var(--font-outfit)',
      }}>
        404
      </div>

      <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: '12px', color: 'var(--gray-50)' }}>
        Chapter Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '40px' }}>
        Looks like this page turned the last page. The story you're looking for doesn't exist or has been moved.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">Go Home</Link>
        <Link href="/login" className="btn btn-secondary">Sign In</Link>
      </div>
    </div>
  )
}
