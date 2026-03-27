import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { RoomsView } from '@/components/rooms/rooms-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('rooms')
  return { title: `${t('title')} — Alea` }
}

interface RoomsPageProps {
  params: Promise<{ locale: string }>
}

export default async function RoomsPage({ params }: RoomsPageProps) {
  const { locale } = await params
  return (
    <ProtectedRoute locale={locale}>
      <RoomsView />
    </ProtectedRoute>
  )
}
