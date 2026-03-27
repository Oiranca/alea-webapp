import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/server/auth'
import { findUserById, getPublicUser } from '@/lib/server/mock-db'

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', statusCode: 401 }, { status: 401 })
  }
  const user = findUserById(session.id)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized', statusCode: 401 }, { status: 401 })
  }
  return NextResponse.json(getPublicUser(user))
}
