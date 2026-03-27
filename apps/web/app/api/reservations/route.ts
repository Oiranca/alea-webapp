import { NextRequest, NextResponse } from 'next/server'
import { enforceSameOriginForMutation, requireAuth } from '@/lib/server/auth'
import { createReservation, getTableById, hasReservationConflict, listReservations } from '@/lib/server/mock-db'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const tableId = searchParams.get('tableId')
  const date = searchParams.get('date')
  const requestedUserId = searchParams.get('userId')

  const effectiveUserId = auth.role === 'admin' ? requestedUserId ?? undefined : auth.id
  const filtered = listReservations({
    userId: effectiveUserId,
    tableId: tableId ?? undefined,
    date: date ?? undefined,
  })

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const body = await request.json()

  const tableId = String(body.tableId ?? '')
  const date = String(body.date ?? '')
  const startTime = String(body.startTime ?? '')
  const endTime = String(body.endTime ?? '')
  const surface = body.surface === 'top' || body.surface === 'bottom' ? body.surface : undefined

  if (!tableId || !date || !startTime || !endTime) {
    return NextResponse.json({ message: 'tableId, date, startTime and endTime are required', statusCode: 400 }, { status: 400 })
  }
  const table = getTableById(tableId)
  if (!table) {
    return NextResponse.json({ message: 'Table not found', statusCode: 404 }, { status: 404 })
  }
  if (table.type === 'removable_top' && !surface) {
    return NextResponse.json({ message: 'Surface is required for removable top tables', statusCode: 400 }, { status: 400 })
  }
  if (startTime >= endTime) {
    return NextResponse.json({ message: 'Invalid reservation time range', statusCode: 400 }, { status: 400 })
  }
  if (hasReservationConflict({ tableId, date, startTime, endTime, surface })) {
    return NextResponse.json({ message: 'Time slot is already reserved', statusCode: 409 }, { status: 409 })
  }

  const newReservation = createReservation({
    tableId,
    userId: auth.id,
    date,
    startTime,
    endTime,
    surface,
  })
  return NextResponse.json(newReservation, { status: 201 })
}
