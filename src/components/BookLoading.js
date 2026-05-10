// BookLoading component — branded loading screen with logo pulse
'use client'

import Image from 'next/image'

export default function BookLoading({ text = '' }) {
  return (
    <div className="loading-page">
      <div className="loading-logo-wrap">
        <Image src="/logo.png" alt="BookFlix" width={180} height={60} priority className="loading-logo" style={{ height: '72px', width: 'auto' }} />
      </div>
      {text && <div className="loading-text-shimmer">{text}</div>}
    </div>
  )
}
