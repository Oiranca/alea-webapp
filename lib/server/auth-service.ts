import type { RegisterRequest, User } from '@/lib/types'
import type { SessionUser } from '@/lib/server/auth'
import { serviceError } from '@/lib/server/service-error'
import { createSupabaseServerAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

type ProfileRow = Tables<'profiles'>
type PublicProfileRow = Pick<ProfileRow, 'id' | 'member_number' | 'role' | 'status' | 'created_at' | 'updated_at'>
const PUBLIC_PROFILE_COLUMNS = 'id, member_number, role, status, created_at, updated_at' as const
const AUTH_EMAIL_DOMAIN = 'members.alea.internal' as const

type PublicProfileLookupColumn = 'id' | 'member_number'
type PublicProfileMaybeSingleResult = Promise<{
  data: PublicProfileRow | null
  error: unknown
}>
type PublicProfilesTableClient = {
  select: (columns: typeof PUBLIC_PROFILE_COLUMNS) => {
    eq: (column: PublicProfileLookupColumn, value: string) => {
      maybeSingle: () => PublicProfileMaybeSingleResult
    }
  }
}
type ProfileLookupClient = {
  from: (table: 'profiles') => unknown
}

type AuthClient = {
  auth: {
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: { user: { id: string } | null }
      error: { message: string } | null
    }>
    signOut: () => Promise<{ error: { message: string } | null }>
  }
}
type AdminProfilesTableClient = PublicProfilesTableClient & {
  update: (values: Partial<ProfileRow>) => {
    eq: (column: 'id', value: string) => Promise<{ error: unknown }>
  }
}
type AdminProfilesClient = ProfileLookupClient & {
  auth: {
    admin: {
      createUser: (payload: {
        email: string
        password: string
        email_confirm: boolean
      }) => Promise<{
        data: { user: { id: string } | null }
        error: { message: string } | null
      }>
      deleteUser: (id: string) => Promise<{ error: { message: string } | null }>
    }
  }
  from: (table: 'profiles') => AdminProfilesTableClient
}

function getProfilesTable(client: ProfileLookupClient) {
  return client.from('profiles') as PublicProfilesTableClient
}

async function getPublicProfileBy(
  client: ProfileLookupClient,
  column: PublicProfileLookupColumn,
  value: string,
) {
  const { data, error } = await getProfilesTable(client)
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq(column, value)
    .maybeSingle()

  if (error) {
    serviceError('Internal server error', 500)
  }

  return data
}
function toPublicUser(profile: PublicProfileRow): User {
  return {
    id: profile.id,
    memberNumber: profile.member_number,
    role: profile.role,
    status: profile.status as User['status'],
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

function normalizeMemberNumber(value: unknown) {
  const memberNumber = String(value ?? '').trim()
  if (!memberNumber) {
    serviceError('Member number is required', 400)
  }
  if (!/^[A-Za-z0-9-]{1,20}$/.test(memberNumber)) {
    serviceError('Invalid member number', 400)
  }
  return memberNumber
}

function getAuthEmail(memberNumber: string) {
  return `${memberNumber.toLowerCase()}@${AUTH_EMAIL_DOMAIN}`
}

export async function login(
  input: { identifier?: unknown; password?: unknown },
  client?: AuthClient,
): Promise<User> {
  const identifier = String(input.identifier ?? '').trim()
  const password = String(input.password ?? '')

  if (!identifier || !password) {
    serviceError('Identifier and password are required', 400)
  }

  // Resolve the auth credential profile by member number (email login not supported).
  const admin = createSupabaseServerAdminClient()
  const credentialProfile = await getPublicProfileBy(admin, 'member_number', identifier)

  if (!credentialProfile) {
    serviceError('Invalid credentials', 401)
  }

  if (credentialProfile.status === 'suspended') {
    serviceError('Suspended account', 403)
  }

  const supabase = client ?? await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: getAuthEmail(credentialProfile.member_number),
    password,
  })

  if (error || !data.user) {
    serviceError('Invalid credentials', 401)
  }

  if (data.user.id !== credentialProfile.id) {
    // Guard against profile/auth drift: the authenticated Supabase user must match
    // the profile resolved by member number.
    serviceError('Invalid credentials', 401)
  }

  return toPublicUser(credentialProfile)
}

export async function register(
  input: unknown,
  client?: AuthClient,
): Promise<User> {
  const payload = input as Partial<RegisterRequest>
  const memberNumber = normalizeMemberNumber(payload?.memberNumber)
  const password = String(payload?.password ?? '')

  if (!password) {
    serviceError('Password is required', 400)
  }

  const admin = createSupabaseServerAdminClient() as unknown as AdminProfilesClient
  const existingMember = await getPublicProfileBy(admin, 'member_number', memberNumber)

  if (existingMember) {
    serviceError('Member number already exists', 409)
  }

  const email = getAuthEmail(memberNumber)

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createUserError || !createdUser.user) {
    serviceError('Unable to create user', 500)
  }

  const createdAuthUser = createdUser.user
  const profiles = admin.from('profiles') as AdminProfilesTableClient

  const { error: updateProfileError } = await profiles
    .update({
      member_number: memberNumber,
      role: 'member',
      status: 'active',
    })
    .eq('id', createdAuthUser.id)

  if (updateProfileError) {
    await admin.auth.admin.deleteUser(createdAuthUser.id)
    serviceError('Unable to create user', 500)
  }

  const signInClient = client ?? await createSupabaseServerClient()
  const { data: signInData, error: signInError } = await signInClient.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !signInData.user) {
    serviceError('Unable to create user', 500)
  }

  const profile = await getPublicProfileBy(admin, 'id', createdAuthUser.id)
  if (!profile) {
    serviceError('Unable to create user', 500)
  }

  return toPublicUser(profile)
}

async function getSessionScopedProfile(id: string, client?: ProfileLookupClient) {
  const supabase = client ?? await createSupabaseServerClient()
  return getPublicProfileBy(supabase, 'id', id)
}

export async function getCurrentUser(
  session: SessionUser | null,
  client?: ProfileLookupClient,
): Promise<User> {
  if (!session) {
    serviceError('Unauthorized', 401)
  }

  const profile = await getSessionScopedProfile(session.id, client)
  if (!profile) {
    serviceError('Unauthorized', 401)
  }

  return toPublicUser(profile)
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    serviceError('Internal server error', 500)
  }

  return { success: true }
}

export async function logoutWithClient(client: AuthClient) {
  const { error } = await client.auth.signOut()

  if (error) {
    serviceError('Internal server error', 500)
  }

  return { success: true }
}
