import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server'
import { enforceSameOriginForMutation } from '@/lib/server/auth'
import { logoutWithClient } from '@/lib/server/auth-service'
import { toServiceErrorResponse } from '@/lib/server/http-error'

export async function POST(request: NextRequest) {
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  try {
    const { supabase, applyCookies } = createSupabaseRouteHandlerClient(request)
    const body = await logoutWithClient(supabase)
    return applyCookies(NextResponse.json(body))
  } catch (error) {
    return toServiceErrorResponse(error)
  }
}
