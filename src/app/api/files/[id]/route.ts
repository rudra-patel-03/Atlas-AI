import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { sanitizeFilename } from '@/lib/security/sanitize'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const file = db.getFiles(userId).find(f => f.id === params.id)
  if (!file) {
    return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 })
  }

  return NextResponse.json({ file })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const body = await req.json()
  const { name } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const safeName = sanitizeFilename(name)
  const updated = db.renameFile(params.id, userId, safeName)
  if (!updated) {
    return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json({ file: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const deleted = db.deleteFile(params.id, userId)
  if (!deleted) {
    return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
