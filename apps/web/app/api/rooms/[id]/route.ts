import { NextRequest, NextResponse } from 'next/server'
import { enforceSameOriginForMutation, requireAdmin } from '@/lib/server/auth'
import { updateRoomById } from '@/lib/server/mock-db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const { id } = await params
  const body = await request.json()
  const updated = updateRoomById(id, {
    name: body.name ? String(body.name) : undefined,
    description: body.description === undefined ? undefined : String(body.description),
    tableCount: body.tableCount === undefined ? undefined : Number(body.tableCount),
  })
  if (!updated) {
    return NextResponse.json({ message: 'Room not found', statusCode: 404 }, { status: 404 })
  }
  return NextResponse.json(updated)
}
