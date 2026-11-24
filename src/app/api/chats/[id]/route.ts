import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { sanitizeString } from '@/lib/security/sanitize'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const chat = db.getChat(params.id, userId)
  if (!chat) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  const messages = db.getMessages(chat.id)
  return NextResponse.json({ chat, messages })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const body = await req.json()
  const { title, pinned, saved, model } = body
  const safeUpdates: any = {}
  if (typeof title === 'string') safeUpdates.title = sanitizeString(title)
  if (typeof pinned === 'boolean') safeUpdates.pinned = pinned
  if (typeof saved === 'boolean') safeUpdates.saved = saved
  if (typeof model === 'string') safeUpdates.model = sanitizeString(model)

  const updated = db.updateChat(params.id, userId, safeUpdates)

  if (!updated) {
    return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json({ chat: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const deleted = db.deleteChat(params.id, userId)
  if (!deleted) {
    return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
