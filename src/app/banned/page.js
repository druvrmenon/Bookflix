export default function BannedPage() {
  return (
    <div className="auth-page fade-in">
      <div className="auth-card" style={{ textAlign: 'center', borderColor: 'var(--red)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
        <h1 style={{ color: 'var(--red)' }}>Account Banned</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Your account has been suspended for violating our terms of service.
          If you believe this is a mistake, please contact the administrator.
        </p>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-secondary w-full">Sign Out</button>
        </form>
      </div>
    </div>
  )
}
