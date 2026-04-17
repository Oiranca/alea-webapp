'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './footer'

interface ConditionalFooterProps {
  locale: string
}

const HIDE_FOOTER_SEGMENTS = ['/login']

export function ConditionalFooter({ locale }: ConditionalFooterProps) {
  const pathname = usePathname()
  const hidden = HIDE_FOOTER_SEGMENTS.some((seg) => pathname.endsWith(seg))
  if (hidden) return null
  return <Footer locale={locale} />
}
