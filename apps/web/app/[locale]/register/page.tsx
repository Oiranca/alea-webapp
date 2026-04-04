import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Sword, Scroll } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth')
  return { title: `${t('register')} -- Alea` }
}

interface RegisterPageProps {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params
  const t = await getTranslations('auth')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4" aria-hidden="true">
            <Scroll className="h-8 w-8 text-primary" />
            <Sword className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-gradient-gold mb-2">{t('register')}</h1>
          <p className="text-muted-foreground">{t('registerSubtitle')}</p>
        </div>
        <div className="rpg-card p-8">
          <div className="space-y-4 text-center">
            <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-foreground">
              <p className="font-medium">{t('registerUnavailableTitle')}</p>
              <p className="mt-2 text-muted-foreground">{t('registerUnavailableBody')}</p>
            </div>
            <Link
              href={`/${locale}/login`}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('login')}
            </Link>
          </div>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('hasAccount')}</span>{' '}
            <Link href={`/${locale}/login`} className="text-primary hover:text-primary/80 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
