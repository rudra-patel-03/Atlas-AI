import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const { searchParams } = new URL(req.url)
  const pinnedOnly = searchParams.get('pinned') === 'true'
  const savedOnly = searchParams.get('saved') === 'true'
  const projectId = searchParams.get('projectId')

  let chats = db.getChats(userId)

  if (pinnedOnly) {
    chats = chats.filter(c => c.pinned)
  }
  if (savedOnly) {
    chats = chats.filter(c => c.saved)
  }
  if (projectId) {
    chats = chats.filter(c => c.projectId === projectId)
  }

  return NextResponse.json({ chats })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const body = await req.json().catch(() => ({}))
  const { title = 'New Conversation', model = 'gemini-2.0-flash', projectId } = body

  const chat = db.createChat(userId, title, model, projectId)
  return NextResponse.json({ chat }, { status: 201 })
}
