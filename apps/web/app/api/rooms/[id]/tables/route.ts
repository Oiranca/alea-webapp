import { NextResponse } from 'next/server'
import { getRoomTables } from '@/lib/server/mock-db'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NextResponse.json(getRoomTables(id))
}
