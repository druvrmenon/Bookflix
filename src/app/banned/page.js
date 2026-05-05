'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BannedPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="auth-page fade-in">
      <div className="auth-card" style={{ textAlign: 'center', borderColor: 'var(--red)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
        <h1 style={{ color: 'var(--red)' }}>Account Banned</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Your account has been suspended for violating our terms of service.
          If you believe this is a mistake, please contact the administrator.
        </p>
        <button onClick={handleSignOut} className="btn btn-secondary w-full">Sign Out</button>
      </div>
    </div>
  )
}
