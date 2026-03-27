import { NextRequest, NextResponse } from 'next/server'
import { buildTableAvailability, getRoomTables } from '@/lib/server/mock-db'
import { requireAuth } from '@/lib/server/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const date = new URL(request.url).searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const tables = getRoomTables(id)
  const availabilityByTableId = tables.reduce<Record<string, ReturnType<typeof buildTableAvailability>>>((acc, table) => {
    acc[table.id] = buildTableAvailability(table.id, date)
    return acc
  }, {})
  return NextResponse.json(availabilityByTableId)
}
