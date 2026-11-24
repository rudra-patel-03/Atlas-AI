import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const project = db.getProject(params.id, userId)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const chats = db.getChats(userId).filter(c => c.projectId === project.id)
  const files = db.getFiles(userId, project.id)

  return NextResponse.json({ project, chats, files })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const body = await req.json()
  const { name, description, category, color, pinned } = body
  const safeUpdates: any = {}
  if (typeof name === 'string') safeUpdates.name = name.slice(0, 100)
  if (typeof description === 'string') safeUpdates.description = description.slice(0, 500)
  if (typeof category === 'string') safeUpdates.category = category.slice(0, 50)
  if (typeof color === 'string') safeUpdates.color = color.slice(0, 30)
  if (typeof pinned === 'boolean') safeUpdates.pinned = pinned

  const updated = db.updateProject(params.id, userId, safeUpdates)

  if (!updated) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json({ project: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const deleted = db.deleteProject(params.id, userId)
  if (!deleted) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
