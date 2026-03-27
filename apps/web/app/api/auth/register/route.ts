import { NextRequest, NextResponse } from 'next/server'
import { enforceSameOriginForMutation, setSessionCookie } from '@/lib/server/auth'
import { createUser, findUserByEmail } from '@/lib/server/mock-db'

export async function POST(request: NextRequest) {
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const body = await request.json()
  const memberNumber = String(body.memberNumber ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!memberNumber || !email || !password) {
    return NextResponse.json({ message: 'Member number, email and password are required', statusCode: 400 }, { status: 400 })
  }
  if (password.length < 12) {
    return NextResponse.json({ message: 'Password must be at least 12 characters', statusCode: 400 }, { status: 400 })
  }
  if (findUserByEmail(email)) {
    return NextResponse.json({ message: 'Email already registered', statusCode: 409 }, { status: 409 })
  }

  const newUser = createUser({ memberNumber, email, password, role: 'member' })
  const response = NextResponse.json(newUser)
  setSessionCookie(response, newUser)
  return response
}
