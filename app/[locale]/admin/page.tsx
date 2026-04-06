import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getSessionFromServerCookies } from '@/lib/server/auth'
import { UsersSection } from '@/components/admin/users-section'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: `${t('dashboard')} — Alea` }
}

interface AdminPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params
  const session = await getSessionFromServerCookies()

  if (!session) {
    redirect(`/${locale}/login`)
  }

  if (session.role !== 'admin') {
    redirect(`/${locale}`)
  }

  const t = await getTranslations('admin')

  return (
    <main id="main-content" className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div>
        <h1 className="font-cinzel text-2xl font-bold text-gradient-gold">{t('dashboard')}</h1>
      </div>

      <section aria-labelledby="users-heading" className="rpg-card p-6 space-y-4">
        <h2 id="users-heading" className="font-cinzel text-lg font-semibold">{t('userManagement')}</h2>
        <UsersSection />
      </section>
    </main>
  )
}
