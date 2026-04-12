import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const routeGetUser = vi.fn()
const profileMaybeSingle = vi.fn()
const resetNoShowsMock = vi.fn()
const routeApplyCookies = vi.fn((response: NextResponse) => response)

function buildProfileClient(getUser: typeof routeGetUser) {
  return {
    auth: {
      getUser,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: profileMaybeSingle,
        })),
      })),
    })),
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseRouteHandlerClient: vi.fn(() => ({
    supabase: buildProfileClient(routeGetUser),
    applyCookies: routeApplyCookies,
  })),
  createSupabaseServerAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  })),
}))

vi.mock('@/lib/server/users-service', () => ({
  resetNoShows: resetNoShowsMock,
}))

const enforceMutationSecurityMock = vi.fn()
const enforceRateLimitMock = vi.fn()

vi.mock('@/lib/server/security', () => ({
  enforceMutationSecurity: enforceMutationSecurityMock,
  enforceRateLimit: enforceRateLimitMock,
  RATE_LIMIT_POLICIES: {
    adminMutation: { bucket: 'admin-mutation', limit: 100, windowMs: 60000 },
  },
}))

function withAdminSession(userId = 'admin-user-1') {
  const authResult = { data: { user: { id: userId } }, error: null }
  const profileResult = {
    data: {
      id: userId,
      role: 'admin',
      email: 'admin@alea.club',
      member_number: '100001',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
    error: null,
  }
  routeGetUser.mockResolvedValue(authResult)
  profileMaybeSingle.mockResolvedValue(profileResult)
}

function withMemberSession(userId = 'member-user-1') {
  const authResult = { data: { user: { id: userId } }, error: null }
  const profileResult = {
    data: {
      id: userId,
      role: 'member',
      email: 'member@alea.club',
      member_number: '100002',
      created_at: '2024-01-02T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
    },
    error: null,
  }
  routeGetUser.mockResolvedValue(authResult)
  profileMaybeSingle.mockResolvedValue(profileResult)
}

function withoutSession() {
  routeGetUser.mockResolvedValue({
    data: { user: null },
    error: null,
  })
  profileMaybeSingle.mockResolvedValue({
    data: null,
    error: null,
  })
}

function createValidRequest(
  userId: string,
  body: unknown,
  options: { csrfToken?: string; cookie?: string } = {},
) {
  const csrfToken = options.csrfToken || 'test-csrf-token'
  const cookie = options.cookie || `alea-csrf-token=${csrfToken}`

  return new NextRequest(`http://localhost:3000/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      'x-csrf-token': csrfToken,
      cookie,
      origin: 'http://localhost:3000',
    },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/users/[id]', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    routeApplyCookies.mockImplementation((response: NextResponse) => response)
    resetNoShowsMock.mockResolvedValue(undefined)
    enforceMutationSecurityMock.mockReturnValue(null)
    enforceRateLimitMock.mockReturnValue(null)
    routeGetUser.mockResolvedValue({ data: { user: null }, error: null })
    profileMaybeSingle.mockResolvedValue({ data: null, error: null })
  })

  describe('resetNoShows action', () => {
    it('returns 200 and calls resetNoShows when admin sends reset_no_shows action', async () => {
      withAdminSession('admin-123')
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const response = await PATCH(
        createValidRequest('user-456', { action: 'reset_no_shows' }),
        { params: Promise.resolve({ id: 'user-456' }) },
      )

      expect(response.status).toBe(200)
      expect(resetNoShowsMock).toHaveBeenCalledWith('user-456')
      expect(routeApplyCookies).toHaveBeenCalled()
    })

    it('calls resetNoShows with the correct userId from params', async () => {
      withAdminSession('admin-123')
      const { PATCH } = await import('@/app/api/users/[id]/route')

      await PATCH(
        createValidRequest('special-user-id', { action: 'reset_no_shows' }),
        { params: Promise.resolve({ id: 'special-user-id' }) },
      )

      expect(resetNoShowsMock).toHaveBeenCalledWith('special-user-id')
    })

    it('returns 403 when called by non-admin member', async () => {
      withMemberSession('member-456')
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const response = await PATCH(
        createValidRequest('user-789', { action: 'reset_no_shows' }),
        { params: Promise.resolve({ id: 'user-789' }) },
      )

      expect(response.status).toBe(403)
      expect(resetNoShowsMock).not.toHaveBeenCalled()
    })

    it('returns 401 when called without authentication', async () => {
      withoutSession()
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const response = await PATCH(
        createValidRequest('user-789', { action: 'reset_no_shows' }),
        { params: Promise.resolve({ id: 'user-789' }) },
      )

      expect(response.status).toBe(401)
      expect(resetNoShowsMock).not.toHaveBeenCalled()
    })
  })

  describe('unknown actions', () => {
    it('returns 400 when action is unknown', async () => {
      withAdminSession()
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const response = await PATCH(
        createValidRequest('user-123', { action: 'unknown_action' }),
        { params: Promise.resolve({ id: 'user-123' }) },
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Unknown action')
      expect(resetNoShowsMock).not.toHaveBeenCalled()
    })

    it('returns 400 when no action is provided', async () => {
      withAdminSession()
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const response = await PATCH(
        createValidRequest('user-123', {}),
        { params: Promise.resolve({ id: 'user-123' }) },
      )

      expect(response.status).toBe(400)
      expect(resetNoShowsMock).not.toHaveBeenCalled()
    })

    it('returns 400 when action is null', async () => {
      withAdminSession()
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const response = await PATCH(
        createValidRequest('user-123', { action: null }),
        { params: Promise.resolve({ id: 'user-123' }) },
      )

      expect(response.status).toBe(400)
      expect(resetNoShowsMock).not.toHaveBeenCalled()
    })
  })

  describe('security middleware', () => {
    it('rejects requests when enforceMutationSecurity fails', async () => {
      withAdminSession()
      enforceMutationSecurityMock.mockReturnValueOnce(
        new NextResponse(JSON.stringify({ message: 'Invalid CSRF token' }), { status: 403 }),
      )
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const request = new NextRequest('http://localhost:3000/api/users/user-123', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ action: 'reset_no_shows' }),
      })

      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-123' }) })

      expect(response.status).toBe(403)
      expect(resetNoShowsMock).not.toHaveBeenCalled()
    })

    it('rejects requests when rate limit is exceeded', async () => {
      withAdminSession()
      enforceRateLimitMock.mockReturnValueOnce(
        new NextResponse(JSON.stringify({ message: 'Too many requests' }), { status: 429 }),
      )
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const response = await PATCH(
        createValidRequest('user-123', { action: 'reset_no_shows' }),
        { params: Promise.resolve({ id: 'user-123' }) },
      )

      expect(response.status).toBe(429)
      expect(resetNoShowsMock).not.toHaveBeenCalled()
    })

    it('applies cookies to the response via applyCookies', async () => {
      withAdminSession()
      const { PATCH } = await import('@/app/api/users/[id]/route')

      await PATCH(
        createValidRequest('user-123', { action: 'reset_no_shows' }),
        { params: Promise.resolve({ id: 'user-123' }) },
      )

      expect(routeApplyCookies).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('returns 500 when resetNoShows throws a ServiceError', async () => {
      const serviceError = new Error('Database error')
      ;(serviceError as any).statusCode = 500
      ;(serviceError as any).name = 'ServiceError'
      resetNoShowsMock.mockRejectedValueOnce(serviceError)

      withAdminSession()
      const { PATCH } = await import('@/app/api/users/[id]/route')

      const response = await PATCH(
        createValidRequest('user-123', { action: 'reset_no_shows' }),
        { params: Promise.resolve({ id: 'user-123' }) },
      )

      expect(response.status).toBe(500)
    })

    it('applies cookies even when an error occurs', async () => {
      const serviceError = new Error('Database error')
      ;(serviceError as any).statusCode = 500
      ;(serviceError as any).name = 'ServiceError'
      resetNoShowsMock.mockRejectedValueOnce(serviceError)

      withAdminSession()
      const { PATCH } = await import('@/app/api/users/[id]/route')

      await PATCH(
        createValidRequest('user-123', { action: 'reset_no_shows' }),
        { params: Promise.resolve({ id: 'user-123' }) },
      )

      expect(routeApplyCookies).toHaveBeenCalled()
    })
  })
})
