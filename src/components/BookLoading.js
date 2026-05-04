// BookLoading component — branded loading screen with logo pulse
'use client'

export default function BookLoading({ text = '' }) {
  return (
    <div className="loading-page">
      <div className="loading-logo-wrap">
        <img src="/logo.png" alt="BookFlix" className="loading-logo" />
      </div>
      {text && <div className="loading-text-shimmer">{text}</div>}
    </div>
  )
}
