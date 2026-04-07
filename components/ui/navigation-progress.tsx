'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'

function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Start progress animation
    setVisible(true)
    setWidth(0)

    const t1 = setTimeout(() => setWidth(80), 50)
    const t2 = setTimeout(() => {
      setWidth(100)
    }, 450)
    const t3 = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname, searchParams])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] h-[2px] bg-primary transition-all ease-out"
      style={{ width: `${width}%`, transitionDuration: width === 80 ? '400ms' : '200ms' }}
    />
  )
}

export function NavigationProgress() {
  return (
    <Suspense>
      <NavigationProgressBar />
    </Suspense>
  )
}
