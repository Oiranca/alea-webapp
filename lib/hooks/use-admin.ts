import { useState, useCallback, useEffect } from 'react'
import type { User, Reservation, Room, GameTable } from '@/lib/types'

interface UseAdminUsersOptions {
  initialUsers?: User[]
}

interface UseAdminUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  updateUser: (id: string, payload: { role?: 'member' | 'admin'; is_active?: boolean }) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  setUsers: (users: User[]) => void
}

export function useAdminUsers({ initialUsers = [] }: UseAdminUsersOptions = {}): UseAdminUsersReturn {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateUser = useCallback(async (
    id: string,
    payload: { role?: 'member' | 'admin'; is_active?: boolean },
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { message?: string }).message ?? 'Failed to update user')
      }
      const updated: User = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { message?: string }).message ?? 'Failed to delete user')
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { users, loading, error, updateUser, deleteUser, setUsers }
}

// ---------------------------------------------------------------------------
// Reservations
// ---------------------------------------------------------------------------

export function useAdminReservations(): { data: Reservation[] | undefined; isLoading: boolean } {
  const [data, setData] = useState<Reservation[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetch('/api/admin/reservations')
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setData(json as Reservation[]) })
      .catch(() => { if (!cancelled) setData([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { data, isLoading }
}

export function useAdminCancelReservation(): {
  mutateAsync: (id: string) => Promise<void>
  isPending: boolean
} {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = useCallback(async (id: string) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/admin/reservations/${id}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { message?: string }).message ?? 'Failed to cancel reservation')
      }
    } finally {
      setIsPending(false)
    }
  }, [])

  return { mutateAsync, isPending }
}

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------

export function useAdminRooms(): { data: Room[] | undefined; isLoading: boolean } {
  const [data, setData] = useState<Room[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetch('/api/admin/rooms')
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setData(json as Room[]) })
      .catch(() => { if (!cancelled) setData([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { data, isLoading }
}

export function useAdminUpdateRoom(): {
  mutateAsync: (args: { id: string; data: { name?: string; description?: string } }) => Promise<void>
  isPending: boolean
} {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = useCallback(async (args: { id: string; data: { name?: string; description?: string } }) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/admin/rooms/${args.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args.data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { message?: string }).message ?? 'Failed to update room')
      }
    } finally {
      setIsPending(false)
    }
  }, [])

  return { mutateAsync, isPending }
}

export function useAdminCreateRoom(): {
  mutateAsync: (data: { name: string; description?: string; tableCount: number }) => Promise<void>
  isPending: boolean
} {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = useCallback(async (data: { name: string; description?: string; tableCount: number }) => {
    setIsPending(true)
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { message?: string }).message ?? 'Failed to create room')
      }
    } finally {
      setIsPending(false)
    }
  }, [])

  return { mutateAsync, isPending }
}

export function useAdminRoomTables(roomId: string): { data: GameTable[] | undefined; isLoading: boolean } {
  const [data, setData] = useState<GameTable[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetch(`/api/admin/rooms/${roomId}/tables`)
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setData(json as GameTable[]) })
      .catch(() => { if (!cancelled) setData([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [roomId])

  return { data, isLoading }
}

export function useAdminCreateTable(): {
  mutateAsync: (args: { roomId: string; data: { name: string; type: 'small' | 'large' | 'removable_top' } }) => Promise<void>
  isPending: boolean
} {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = useCallback(async (args: { roomId: string; data: { name: string; type: 'small' | 'large' | 'removable_top' } }) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/admin/rooms/${args.roomId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args.data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { message?: string }).message ?? 'Failed to create table')
      }
    } finally {
      setIsPending(false)
    }
  }, [])

  return { mutateAsync, isPending }
}
