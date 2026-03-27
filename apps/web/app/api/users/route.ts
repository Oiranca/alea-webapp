import { NextRequest, NextResponse } from 'next/server'
import type { User, PaginatedResponse } from '@alea/types'
import { listUsers } from '@/lib/server/mock-db'
import { requireAdmin } from '@/lib/server/auth'

export async function GET(request: NextRequest) {
  const admin = requireAdmin(request)
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '10')
  const search = searchParams.get('search') ?? ''

  let filtered = listUsers()
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter((u) => u.email.toLowerCase().includes(q) || u.memberNumber.includes(q))
  }

  const total = filtered.length
  const response: PaginatedResponse<User> = {
    data: filtered.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
  return NextResponse.json(response)
}
