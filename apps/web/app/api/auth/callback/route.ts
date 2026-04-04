import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server'
import { toServiceErrorResponse } from '@/lib/server/http-error'
import { serviceError } from '@/lib/server/service-error'

/**
 * Supabase PKCE auth callback handler.
 * This route is called by Supabase after OAuth or magic link authentication.
 * The full implementation is wired in M3 (auth cutover).
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const raw = requestUrl.searchParams.get('next') ?? '/'

  // Reject control characters that can bypass path validation (e.g. %0A → \n)
  const sanitized = /[\x00-\x1f]/.test(raw) ? '/' : raw

  // Regex requires /X where X is not / or \. Bare "/" falls through to the default fallback.
  const isRelative = /^\/[^/\\]/.test(sanitized)
  let finalRedirect = isRelative ? sanitized : '/'

  // Same-origin verification to prevent open redirect after URL resolution
  try {
    const resolved = new URL(finalRedirect, requestUrl.origin)
    if (resolved.origin !== requestUrl.origin) {
      finalRedirect = '/'
    }
  } catch {
    finalRedirect = '/'
  }

  if (code) {
    try {
      const { supabase, applyCookies } = createSupabaseRouteHandlerClient(request)
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        serviceError('Authentication callback failed', 401)
      }

      return applyCookies(NextResponse.redirect(new URL(finalRedirect, requestUrl.origin)))
    } catch (error) {
      return toServiceErrorResponse(error)
    }
  }

  return NextResponse.redirect(new URL(finalRedirect, requestUrl.origin))
}
