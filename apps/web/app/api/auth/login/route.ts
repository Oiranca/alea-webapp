import { NextRequest, NextResponse } from 'next/server'
import { enforceSameOriginForMutation, setSessionCookie } from '@/lib/server/auth'
import { findUserByIdentifier, getPublicUser, verifyUserPassword } from '@/lib/server/mock-db'

export async function POST(request: NextRequest) {
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const body = await request.json()
  const identifier = String(body.identifier ?? '').trim()
  const password = String(body.password ?? '')
  if (!identifier || !password) {
    return NextResponse.json({ message: 'Identifier and password are required', statusCode: 400 }, { status: 400 })
  }

  const user = findUserByIdentifier(identifier)
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials', statusCode: 401 }, { status: 401 })
  }
  if (!verifyUserPassword(user, password)) {
    return NextResponse.json({ message: 'Invalid credentials', statusCode: 401 }, { status: 401 })
  }

  const safeUser = getPublicUser(user)
  const response = NextResponse.json(safeUser)
  setSessionCookie(response, safeUser)
  return response
}
