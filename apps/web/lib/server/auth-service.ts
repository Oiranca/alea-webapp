import type { User } from '@alea/types'
import type { SessionUser } from '@/lib/server/auth'
import { serviceError } from '@/lib/server/service-error'
import { createSupabaseServerAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

type ProfileRow = Tables<'profiles'>
type AuthClient = {
  auth: {
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: { user: { id: string } | null }
      error: { message: string } | null
    }>
    signOut: () => Promise<{ error: { message: string } | null }>
  }
}

async function rollbackCreatedAuthUser(userId: string) {
  const admin = createSupabaseServerAdminClient()
  await admin.auth.admin.deleteUser(userId)
}

function toPublicUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    memberNumber: profile.member_number,
    email: profile.email,
    role: profile.role,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

async function getProfileById(id: string) {
  const admin = createSupabaseServerAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    serviceError('Internal server error', 500)
  }

  return data
}

async function getProfileByEmail(email: string) {
  const admin = createSupabaseServerAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    serviceError('Internal server error', 500)
  }

  return data
}

async function getProfileByMemberNumber(memberNumber: string) {
  const admin = createSupabaseServerAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .eq('member_number', memberNumber)
    .maybeSingle()

  if (error) {
    serviceError('Internal server error', 500)
  }

  return data
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

  const profile = identifier.includes('@')
    ? await getProfileByEmail(identifier.toLowerCase())
    : await getProfileByMemberNumber(identifier)

  if (!profile) {
    serviceError('Invalid credentials', 401)
  }

  const supabase = client ?? await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  })

  if (error || !data.user) {
    serviceError('Invalid credentials', 401)
  }

  return toPublicUser(profile)
}

export async function register(
  input: { memberNumber?: unknown; email?: unknown; password?: unknown },
  client?: AuthClient,
): Promise<User> {
  const memberNumber = String(input.memberNumber ?? '').trim()
  const email = String(input.email ?? '').trim().toLowerCase()
  const password = String(input.password ?? '')

  if (!memberNumber || !email || !password) {
    serviceError('Member number, email and password are required', 400)
  }
  if (password.length < 12) {
    serviceError('Password must be at least 12 characters', 400)
  }
  if (await getProfileByEmail(email)) {
    serviceError('Email already registered', 409)
  }
  if (await getProfileByMemberNumber(memberNumber)) {
    serviceError('Member number already registered', 409)
  }

  const admin = createSupabaseServerAdminClient()
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError || !created.user) {
    const statusCode = createError?.message.toLowerCase().includes('already') ? 409 : 500
    serviceError(createError?.message ?? 'Internal server error', statusCode)
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ member_number: memberNumber, email })
    .eq('id', created.user.id)

  if (profileError) {
    await rollbackCreatedAuthUser(created.user.id)
    const statusCode = profileError.message.toLowerCase().includes('duplicate') ? 409 : 500
    serviceError(profileError.message, statusCode)
  }

  const supabase = client ?? await createSupabaseServerClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    serviceError('Internal server error', 500)
  }

  const profile = await getProfileById(created.user.id)
  if (!profile) {
    serviceError('Internal server error', 500)
  }

  return toPublicUser(profile)
}

export async function getCurrentUser(session: SessionUser | null): Promise<User> {
  if (!session) {
    serviceError('Unauthorized', 401)
  }

  const profile = await getProfileById(session.id)
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
