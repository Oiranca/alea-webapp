import type { SessionUser } from '@/lib/server/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const memberSession: SessionUser = {
  id: '2',
  role: 'member',
}

async function loadReservationModules() {
  vi.resetModules()

  const service = await import('@/lib/server/reservations-service')
  const db = await import('@/lib/server/mock-db')

  return { ...service, ...db }
}

describe('updateReservationForSession', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('treats null status as absent', async () => {
    const { updateReservationForSession } = await loadReservationModules()

    const updated = updateReservationForSession(memberSession, 'r1', { status: null })

    expect(updated.status).toBe('active')
  })

  it('treats null date and times as absent while applying explicit updates', async () => {
    const { findReservationById, updateReservationForSession } = await loadReservationModules()
    const existing = findReservationById('r1')

    expect(existing).not.toBeNull()

    const updated = updateReservationForSession(memberSession, 'r1', {
      date: null,
      startTime: null,
      endTime: null,
      status: null,
      surface: null,
    })

    expect(updated.date).toBe(existing!.date)
    expect(updated.startTime).toBe(existing!.startTime)
    expect(updated.endTime).toBe(existing!.endTime)
    expect(updated.status).toBe(existing!.status)
  })

  it('updates explicitly provided non-null fields', async () => {
    const { updateReservationForSession } = await loadReservationModules()

    const updated = updateReservationForSession(memberSession, 'r1', {
      status: null,
      startTime: '18:00',
      endTime: '19:00',
    })

    expect(updated.status).toBe('active')
    expect(updated.startTime).toBe('18:00')
    expect(updated.endTime).toBe('19:00')
  })
})
