import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/server/auth'
import { getCurrentUser } from '@/lib/server/auth-service'
import { toServiceErrorResponse } from '@/lib/server/http-error'

export async function GET(request: NextRequest) {
  const auth = await getSessionFromRequest(request)

  try {
    return auth.applyCookies(NextResponse.json(await getCurrentUser(auth.session)))
  } catch (error) {
    return auth.applyCookies(toServiceErrorResponse(error))
  }
}
