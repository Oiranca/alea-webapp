import { NextResponse } from 'next/server'
import { cancelExpiredPendingReservations } from '@/lib/server/reservations-service'

export async function POST(request: Request) {
  const auth = request.headers.get('Authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const cancelled = await cancelExpiredPendingReservations()
  return NextResponse.json({ cancelled })
}
