import { beforeEach, describe, expect, it, vi } from 'vitest'

type ProfileRow = {
  id: string
  member_number: string
  email?: string | null
  role: 'member' | 'admin'
  status: 'active' | 'suspended'
  created_at: string
  updated_at: string
}

const adminState = {
  byEmail: new Map<string, ProfileRow>(),
  byMemberNumber: new Map<string, ProfileRow>(),
  byId: new Map<string, ProfileRow>(),
}

const signInWithPassword = vi.fn()
const signOut = vi.fn()
const sessionScopedProfileMaybeSingle = vi.fn()
const createUserAdminMock = vi.fn()
const deleteUserAdminMock = vi.fn()
const updateProfileMock = vi.fn()

function toAuthEmail(memberNumber: string) {
  return `${memberNumber.toLowerCase()}@members.alea.internal`
}

function makeProfile(overrides?: Partial<ProfileRow>): ProfileRow {
  const memberNumber = overrides?.member_number ?? '100001'
  return {
    id: 'user-1',
    member_number: memberNumber,
    email: toAuthEmail(memberNumber),
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signInWithPassword,
      signOut,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn((column: string, value: string) => ({
          maybeSingle: vi.fn(async () => {
            sessionScopedProfileMaybeSingle(column, value)
            if (column === 'id') {
              return { data: adminState.byId.get(value) ?? null, error: null }
            }
            return { data: null, error: null }
          }),
        })),
      })),
    })),
  })),
  createSupabaseServerAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: createUserAdminMock,
        deleteUser: deleteUserAdminMock,
      },
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn((column: string, value: string) => ({
          maybeSingle: vi.fn(async () => {
            if (column === 'member_number') {
              return { data: adminState.byMemberNumber.get(value) ?? null, error: null }
            }
            if (column === 'id') {
              return { data: adminState.byId.get(value) ?? null, error: null }
            }
            return { data: null, error: null }
          }),
        })),
      })),
      update: vi.fn((updates: Partial<ProfileRow>) => ({
        eq: vi.fn(async (_column: string, id: string) => {
          updateProfileMock(updates, id)
          const current = adminState.byId.get(id)
          if (!current) {
            return { error: { message: 'missing profile' } }
          }
          const next = { ...current, ...updates }
          adminState.byId.set(id, next)
          adminState.byMemberNumber.delete(current.member_number)
          adminState.byMemberNumber.set(next.member_number, next)
          if (current.email) adminState.byEmail.delete(current.email)
          if (next.email) adminState.byEmail.set(next.email, next)
          return { error: null }
        }),
      })),
    })),
  })),
}))

async function loadService() {
  return import('@/lib/server/auth-service')
}

describe('auth service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    adminState.byEmail.clear()
    adminState.byMemberNumber.clear()
    adminState.byId.clear()
    signOut.mockResolvedValue({ error: null })
    sessionScopedProfileMaybeSingle.mockReset()

    const admin = makeProfile()
    const member = makeProfile({
      id: 'user-2',
      member_number: '100002',
      role: 'member',
    })
    adminState.byEmail.set(admin.email ?? '', admin)
    adminState.byMemberNumber.set(admin.member_number, admin)
    adminState.byId.set(admin.id, admin)
    adminState.byEmail.set(member.email ?? '', member)
    adminState.byMemberNumber.set(member.member_number, member)
    adminState.byId.set(member.id, member)

    signInWithPassword.mockImplementation(async ({ email }: { email: string }) => {
      const profile = adminState.byEmail.get(email)
      if (!profile) return { data: { user: null }, error: { message: 'Invalid credentials' } }
      return { data: { user: { id: profile.id } }, error: null }
    })

    createUserAdminMock.mockImplementation(async ({ email }: { email: string }) => {
      const nextId = 'user-3'
      const profile = makeProfile({
        id: nextId,
        member_number: `M-${nextId}`,
        role: 'member',
        status: 'active',
        email,
      })
      adminState.byId.set(nextId, profile)
      adminState.byMemberNumber.set(profile.member_number, profile)
      adminState.byEmail.set(email, profile)
      return { data: { user: { id: nextId } }, error: null }
    })
    deleteUserAdminMock.mockResolvedValue({ error: null })
  })

  describe('login', () => {
    it('returns the public user for a valid member number / password pair', async () => {
      const { login } = await loadService()

      await expect(
        login({ identifier: '100001', password: 'Admin1234!@#' }),
      ).resolves.toMatchObject({
        id: 'user-1',
        role: 'admin',
        memberNumber: '100001',
        status: 'active',
      })
    })

    it('resolves the member number to the synthetic Supabase Auth email before signing in', async () => {
      const { login } = await loadService()

      await expect(
        login({ identifier: '100002', password: 'Socio1234!@#' }),
      ).resolves.toMatchObject({
        id: 'user-2',
      })
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: '100002@members.alea.internal',
        password: 'Socio1234!@#',
      })
    })

    it('rejects missing credentials with a 400 ServiceError', async () => {
      const { login } = await loadService()

      await expect(login({ identifier: '100001' })).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 400,
      })
    })

    it('rejects an unknown member number with a 401 ServiceError', async () => {
      const { login } = await loadService()

      await expect(
        login({ identifier: '999999', password: 'Admin1234!@#' }),
      ).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 401,
      })
    })

    it('rejects suspended members before attempting sign-in', async () => {
      const { login } = await loadService()
      adminState.byMemberNumber.set('100777', makeProfile({
        id: 'user-7',
        member_number: '100777',
        role: 'member',
        status: 'suspended',
      }))

      await expect(
        login({ identifier: '100777', password: 'Blocked1234!@#' }),
      ).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 403,
      })
    })
  })

  describe('register', () => {
    it('creates a member, signs in, and returns the public user payload', async () => {
      const { register } = await loadService()

      await expect(
        register({ memberNumber: '100099', password: 'Password1234!@#' }),
      ).resolves.toMatchObject({
        id: 'user-3',
        memberNumber: '100099',
        role: 'member',
        status: 'active',
      })
      expect(createUserAdminMock).toHaveBeenCalledWith({
        email: '100099@members.alea.internal',
        password: 'Password1234!@#',
        email_confirm: true,
      })
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: '100099@members.alea.internal',
        password: 'Password1234!@#',
      })
    })

    it('rejects duplicate member numbers', async () => {
      const { register } = await loadService()

      await expect(
        register({ memberNumber: '100001', password: 'Password1234!@#' }),
      ).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 409,
      })
    })

    it('rejects missing required fields', async () => {
      const { register } = await loadService()

      await expect(register({})).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 400,
      })
    })
  })

  describe('getCurrentUser', () => {
    it('rejects when no session is present', async () => {
      const { getCurrentUser } = await loadService()

      await expect(getCurrentUser(null)).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 401,
      })
    })

    it('rejects when the session user profile is missing', async () => {
      const { getCurrentUser } = await loadService()

      await expect(getCurrentUser({ id: 'missing-user', role: 'member' })).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 401,
      })
    })

    it('reads the current profile through the session-scoped client instead of the admin client', async () => {
      const { getCurrentUser } = await loadService()

      await expect(getCurrentUser({ id: 'user-2', role: 'member' })).resolves.toMatchObject({
        id: 'user-2',
        role: 'member',
      })
      expect(sessionScopedProfileMaybeSingle).toHaveBeenCalledWith('id', 'user-2')
    })
  })

  describe('logout', () => {
    it('returns success when the server client signs out cleanly', async () => {
      const { logout } = await loadService()

      await expect(logout()).resolves.toEqual({ success: true })
    })

    it('maps sign-out failures to a 500 ServiceError', async () => {
      const { logout } = await loadService()
      signOut.mockResolvedValueOnce({ error: { message: 'sign-out failed' } })

      await expect(logout()).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 500,
      })
    })

    it('maps route-handler sign-out failures to a 500 ServiceError', async () => {
      const { logoutWithClient } = await loadService()

      await expect(
        logoutWithClient({
          auth: {
            signInWithPassword,
            signOut: vi.fn(async () => ({ error: { message: 'sign-out failed' } })),
          },
        }),
      ).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 500,
      })
    })
  })
})
