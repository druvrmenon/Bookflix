import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const alt = 'BookFlix — Rent Your Next Great Read'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Read logo as base64
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const logoData = await readFile(logoPath)
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          background: '#1a0a0a',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Subtle warm glow */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(201,149,108,0.1) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Logo */}
        <img src={logoBase64} height={120} />
        {/* Tagline */}
        <div
          style={{
            color: '#e0d6cc',
            fontSize: '28px',
            fontWeight: 400,
            letterSpacing: '0.02em',
          }}
        >
          Rent Your Next Great Read
        </div>
        {/* CTA */}
        <div
          style={{
            marginTop: '16px',
            padding: '14px 36px',
            border: '1.5px solid #c9956c',
            borderRadius: '999px',
            color: '#c9956c',
            fontSize: '20px',
            fontWeight: 600,
            background: 'rgba(201,149,108,0.08)',
          }}
        >
          Browse the Catalog →
        </div>
      </div>
    ),
    { ...size }
  )
}
