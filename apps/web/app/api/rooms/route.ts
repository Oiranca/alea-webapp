import { NextRequest, NextResponse } from 'next/server'
import { enforceSameOriginForMutation, requireAdmin } from '@/lib/server/auth'
import { createRoomEntry, listAllRooms } from '@/lib/server/rooms-service'
import { toServiceErrorResponse } from '@/lib/server/http-error'

export async function GET() {
  return NextResponse.json(listAllRooms())
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const originError = enforceSameOriginForMutation(request)
  if (originError) return admin.applyCookies(originError)

  try {
    const body = await request.json()
    return admin.applyCookies(NextResponse.json(createRoomEntry(body), { status: 201 }))
  } catch (error) {
    return admin.applyCookies(toServiceErrorResponse(error))
  }
}
