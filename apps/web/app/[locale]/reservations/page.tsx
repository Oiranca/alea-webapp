import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { MyReservationsView } from '@/components/reservations/my-reservations-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reservations')
  return { title: `${t('title')} — Alea` }
}

interface ReservationsPageProps {
  params: Promise<{ locale: string }>
}

export default async function ReservationsPage({ params }: ReservationsPageProps) {
  const { locale } = await params
  return (
    <ProtectedRoute locale={locale}>
      <MyReservationsView />
    </ProtectedRoute>
  )
}
