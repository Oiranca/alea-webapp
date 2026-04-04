import { beforeEach, describe, expect, it, vi } from 'vitest'

type ProfileRow = {
  id: string
  member_number: string
  email: string
  role: 'member' | 'admin'
  created_at: string
  updated_at: string
}

const adminState = {
  byEmail: new Map<string, ProfileRow>(),
  byMemberNumber: new Map<string, ProfileRow>(),
  byId: new Map<string, ProfileRow>(),
  deletedUserIds: [] as string[],
  createUserResult: {
    data: { user: { id: 'user-3' } },
    error: null as { message: string } | null,
  },
  updateError: null as { message: string } | null,
}

const signInWithPassword = vi.fn()
const signOut = vi.fn()

function makeProfile(overrides?: Partial<ProfileRow>): ProfileRow {
  return {
    id: 'user-1',
    member_number: '100001',
    email: 'admin@alea.club',
    role: 'admin',
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
  })),
  createSupabaseServerAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: vi.fn(async () => adminState.createUserResult),
        deleteUser: vi.fn(async (userId: string) => {
          adminState.deletedUserIds.push(userId)
          return { data: { user: null }, error: null }
        }),
      },
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn((column: string, value: string) => ({
          maybeSingle: vi.fn(async () => {
            if (column === 'email') {
              return { data: adminState.byEmail.get(value) ?? null, error: null }
            }
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
      update: vi.fn((patch: { member_number: string; email: string }) => ({
        eq: vi.fn(async (_column: string, value: string) => {
          const current = adminState.byId.get(value)
          if (current) {
            const next = {
              ...current,
              member_number: patch.member_number,
              email: patch.email,
            }
            adminState.byId.set(value, next)
            adminState.byEmail.set(next.email, next)
            adminState.byMemberNumber.set(next.member_number, next)
          }
          return { error: adminState.updateError }
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
    adminState.deletedUserIds = []
    adminState.updateError = null
    adminState.createUserResult = {
      data: { user: { id: 'user-3' } },
      error: null,
    }
    signInWithPassword.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    signOut.mockResolvedValue({ error: null })

    const admin = makeProfile()
    const member = makeProfile({
      id: 'user-2',
      member_number: '100002',
      email: 'socio@alea.club',
      role: 'member',
    })
    adminState.byEmail.set(admin.email, admin)
    adminState.byMemberNumber.set(admin.member_number, admin)
    adminState.byId.set(admin.id, admin)
    adminState.byEmail.set(member.email, member)
    adminState.byMemberNumber.set(member.member_number, member)
    adminState.byId.set(member.id, member)
  })

  describe('login', () => {
    it('returns the public user for a valid email/password pair', async () => {
      const { login } = await loadService()

      await expect(
        login({ identifier: 'admin@alea.club', password: 'Admin1234!@#' }),
      ).resolves.toMatchObject({
        id: 'user-1',
        role: 'admin',
        email: 'admin@alea.club',
        memberNumber: '100001',
      })
    })

    it('resolves the member number to email before signing in', async () => {
      const { login } = await loadService()

      await expect(
        login({ identifier: '100002', password: 'Socio1234!@#' }),
      ).resolves.toMatchObject({
        id: 'user-2',
        email: 'socio@alea.club',
      })
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'socio@alea.club',
        password: 'Socio1234!@#',
      })
    })

    it('rejects missing credentials with a 400 ServiceError', async () => {
      const { login } = await loadService()

      await expect(login({ identifier: 'admin@alea.club' })).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 400,
      })
    })

    it('rejects an unknown identifier with a 401 ServiceError', async () => {
      const { login } = await loadService()

      await expect(
        login({ identifier: 'nobody@alea.club', password: 'Admin1234!@#' }),
      ).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 401,
      })
    })

    it('rejects invalid credentials when Supabase sign-in fails', async () => {
      const { login } = await loadService()
      signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      })

      await expect(
        login({ identifier: 'admin@alea.club', password: 'wrong-password' }),
      ).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 401,
      })
    })
  })

  describe('register', () => {
    it('creates the auth user, updates the profile, signs in, and returns the public profile', async () => {
      const { register } = await loadService()
      const createdProfile = makeProfile({
        id: 'user-3',
        member_number: '100099',
        email: 'nuevo@alea.club',
        role: 'member',
      })
      adminState.byId.set(createdProfile.id, createdProfile)

      await expect(
        register({
          memberNumber: '100099',
          email: 'nuevo@alea.club',
          password: 'Password1234!@#',
        }),
      ).resolves.toMatchObject({
        id: 'user-3',
        memberNumber: '100099',
        email: 'nuevo@alea.club',
        role: 'member',
      })
    })

    it('rejects a duplicate email with a 409 ServiceError', async () => {
      const { register } = await loadService()

      await expect(
        register({
          memberNumber: '100099',
          email: 'admin@alea.club',
          password: 'Password1234!@#',
        }),
      ).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 409,
      })
    })

    it('rolls back the auth user when the profile update fails', async () => {
      const { register } = await loadService()
      adminState.updateError = { message: 'duplicate key value violates unique constraint' }

      await expect(
        register({
          memberNumber: '100099',
          email: 'nuevo@alea.club',
          password: 'Password1234!@#',
        }),
      ).rejects.toMatchObject({
        name: 'ServiceError',
        statusCode: 409,
      })

      expect(adminState.deletedUserIds).toEqual(['user-3'])
    })
  })
})
