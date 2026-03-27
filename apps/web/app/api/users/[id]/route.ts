import { NextRequest, NextResponse } from 'next/server'
import { deleteUserById, findUserById, getPublicUser, updateUserById } from '@/lib/server/mock-db'
import { enforceSameOriginForMutation, requireAdmin } from '@/lib/server/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const { id } = await params
  const existing = findUserById(id)
  if (!existing) {
    return NextResponse.json({ message: 'User not found', statusCode: 404 }, { status: 404 })
  }

  const body = await request.json()
  const updated = updateUserById(id, {
    memberNumber: body.memberNumber ? String(body.memberNumber) : undefined,
    email: body.email ? String(body.email).toLowerCase() : undefined,
    role: body.role === 'admin' || body.role === 'member' ? body.role : undefined,
  })
  return NextResponse.json(updated ?? getPublicUser(existing))
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  const originError = enforceSameOriginForMutation(request)
  if (originError) return originError

  const { id } = await params
  if (!deleteUserById(id)) {
    return NextResponse.json({ message: 'User not found', statusCode: 404 }, { status: 404 })
  }
  return new Response(null, { status: 204 })
}
