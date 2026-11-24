import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const agent = db.getAgent(params.id)
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }
  return NextResponse.json({ agent })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const deleted = db.deleteAgent(params.id, userId)
  if (!deleted) {
    return NextResponse.json({ error: 'Cannot delete default system agent or unauthorized' }, { status: 403 })
  }
  return NextResponse.json({ success: true })
}
