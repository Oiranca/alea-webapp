import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getSessionFromServerCookies } from '@/lib/server/auth'
import { activateReservationByTable } from '@/lib/server/reservations-service'
import { CheckInResult } from '@/components/check-in/check-in-result'
import type { CheckInStatus } from '@/components/check-in/check-in-result'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('checkin')
  return { title: `${t('title')} — Alea` }
}

interface CheckInPageProps {
  params: Promise<{ locale: string; tableId: string }>
  searchParams: Promise<{ side?: string }>
}

export default async function CheckInPage({ params, searchParams }: CheckInPageProps) {
  const { locale, tableId } = await params
  const { side: sideParam } = await searchParams

  const session = await getSessionFromServerCookies()
  if (!session) {
    redirect(`/${locale}/login?returnUrl=/${locale}/check-in/${tableId}${sideParam === 'inf' ? '?side=inf' : ''}`)
  }

  const side = sideParam === 'inf' ? ('inf' as const) : undefined

  let status: CheckInStatus = 'error'

  try {
    await activateReservationByTable(tableId, session.id, side)
    status = 'activated'
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    switch (msg) {
      case 'CHECK_IN_ALREADY_ACTIVE':
        status = 'already_active'
        break
      case 'CHECK_IN_TOO_EARLY':
        status = 'too_early'
        break
      case 'CHECK_IN_TOO_LATE':
        status = 'too_late'
        break
      case 'CHECK_IN_NO_RESERVATION':
        status = 'no_reservation'
        break
      default:
        status = 'error'
    }
  }

  return (
    <main id="main-content">
      <CheckInResult status={status} />
    </main>
  )
}
