import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { sanitizeString } from '@/lib/security/sanitize'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const agents = db.getAgents(userId)
  return NextResponse.json({ agents })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    const body = await req.json()
    const { name, role, description, instructions, avatar = '🤖', model = 'gemini-2.0-flash', category = 'Custom' } = body

    const cleanName = sanitizeString(name)
    const cleanInstructions = sanitizeString(instructions)

    if (!cleanName || !cleanInstructions) {
      return NextResponse.json({ error: 'Agent name and instructions are required' }, { status: 400 })
    }

    const agent = db.createAgent(userId, {
      name: cleanName,
      role: sanitizeString(role) || 'AI Assistant',
      description: sanitizeString(description) || 'Custom user configured agent',
      instructions: cleanInstructions,
      avatar: sanitizeString(avatar) || '🤖',
      model,
      category: sanitizeString(category) || 'Custom',
    })

    return NextResponse.json({ agent }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create agent' }, { status: 500 })
  }
}
