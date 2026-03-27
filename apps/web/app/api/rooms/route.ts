import { NextRequest, NextResponse } from 'next/server'
import { createRoom, listRooms } from '@/lib/server/mock-db'
import { enforceSameOriginForMutation, requireAdmin } from '@/lib/server/auth'

export async function GET() {
  return NextResponse.json(listRooms())
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const body = await request.json()
  const name = String(body.name ?? '').trim()
  if (!name) {
    return NextResponse.json({ message: 'Room name is required', statusCode: 400 }, { status: 400 })
  }

  const newRoom = createRoom({
    name,
    tableCount: Number(body.tableCount ?? 0),
    description: body.description ? String(body.description) : undefined,
  })
  return NextResponse.json(newRoom, { status: 201 })
}
