// Portal component — renders children at document.body level
// Fixes position:fixed modals breaking inside parents with backdrop-filter/transform
'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Portal({ children }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}
