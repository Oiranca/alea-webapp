import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient, createSupabaseServerAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

export type SessionUser = {
  id: string
  role: 'member' | 'admin'
}

async function getSessionUser(client: { auth: { getUser: () => Promise<{ data: { user: { id: string } | null }, error: unknown }> } }) {
  const { data: authData, error: authError } = await client.auth.getUser()

  if (authError || !authData.user) {
    return null
  }

  const admin = createSupabaseServerAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return null
  }

  return {
    id: profile.id,
    role: profile.role,
  } satisfies SessionUser
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const { supabase } = createSupabaseRouteHandlerClient(request)
  return getSessionUser(supabase)
}

export async function getSessionFromServerCookies(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient()
  return getSessionUser(supabase)
}

export async function requireAuth(request: NextRequest): Promise<SessionUser | NextResponse> {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ message: 'Unauthorized', statusCode: 401 }, { status: 401 })
  return session
}

export async function requireAdmin(request: NextRequest): Promise<SessionUser | NextResponse> {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  if (session.role !== 'admin') return NextResponse.json({ message: 'Forbidden', statusCode: 403 }, { status: 403 })
  return session
}

export function enforceSameOriginForMutation(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase()
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return null

  const origin = request.headers.get('origin')
  if (!origin) {
    return NextResponse.json({ message: 'Invalid request origin', statusCode: 403 }, { status: 403 })
  }

  try {
    const requestOrigin = new URL(request.url).origin
    if (new URL(origin).origin !== requestOrigin) {
      return NextResponse.json({ message: 'Invalid request origin', statusCode: 403 }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ message: 'Invalid request origin', statusCode: 403 }, { status: 403 })
  }

  return null
}
