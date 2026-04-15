import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server'
import { activateAccount } from '@/lib/server/auth-service'
import { toServiceErrorResponse } from '@/lib/server/http-error'
import { enforceMutationSecurity, enforceRateLimit, RATE_LIMIT_POLICIES } from '@/lib/server/security'

export async function POST(request: NextRequest) {
  const securityError = enforceMutationSecurity(request)
  if (securityError) return securityError

  const rateLimitError = enforceRateLimit(request, RATE_LIMIT_POLICIES.authRegister)
  if (rateLimitError) return rateLimitError

  try {
    const { supabase, applyCookies } = createSupabaseRouteHandlerClient(request)
    const body = await request.json()
    const result = await activateAccount(body)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: result.authEmail,
      password: body.password,
    })

    if (signInError) {
      return applyCookies(NextResponse.json({
        message: 'Account activated, but automatic sign-in failed. Please sign in with your member number and new password.',
        statusCode: 500,
      }, { status: 500 }))
    }

    return applyCookies(NextResponse.json(result.user))
  } catch (error) {
    return toServiceErrorResponse(error)
  }
}
