import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, enforceSameOriginForMutation } from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const response = NextResponse.json({ success: true })
  clearSessionCookie(response)
  return response
}
