import { NextRequest, NextResponse } from 'next/server'
import { enforceSameOriginForMutation, requireAuth } from '@/lib/server/auth'
import { findReservationById, hasReservationConflict, updateReservationById } from '@/lib/server/mock-db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const { id } = await params
  const existingReservation = findReservationById(id)
  if (!existingReservation) {
    return NextResponse.json({ message: 'Reservation not found', statusCode: 404 }, { status: 404 })
  }
  if (auth.role !== 'admin' && existingReservation.userId !== auth.id) {
    return NextResponse.json({ message: 'Forbidden', statusCode: 403 }, { status: 403 })
  }

  const body = await request.json()
  const nextStatus = body.status
  if (nextStatus && !['active', 'cancelled', 'completed'].includes(nextStatus)) {
    return NextResponse.json({ message: 'Invalid reservation status', statusCode: 400 }, { status: 400 })
  }

  const nextStartTime = body.startTime ?? existingReservation.startTime
  const nextEndTime = body.endTime ?? existingReservation.endTime
  const nextDate = body.date ?? existingReservation.date
  const nextSurface = body.surface ?? existingReservation.surface ?? undefined
  if (nextStartTime >= nextEndTime) {
    return NextResponse.json({ message: 'Invalid reservation time range', statusCode: 400 }, { status: 400 })
  }
  if (
    hasReservationConflict({
      tableId: existingReservation.tableId,
      date: nextDate,
      startTime: nextStartTime,
      endTime: nextEndTime,
      surface: nextSurface,
      ignoreReservationId: existingReservation.id,
    })
  ) {
    return NextResponse.json({ message: 'Time slot is already reserved', statusCode: 409 }, { status: 409 })
  }

  const updated = updateReservationById(id, {
    date: nextDate,
    startTime: nextStartTime,
    endTime: nextEndTime,
    surface: nextSurface,
    status: nextStatus ?? existingReservation.status,
  })
  return NextResponse.json(updated)
}
