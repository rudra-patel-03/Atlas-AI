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

  const projects = db.getProjects(userId)
  return NextResponse.json({ projects })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    const body = await req.json()
    const { name, description, category, instructions, notes } = body

    const cleanName = sanitizeString(name)
    if (!cleanName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const project = db.createProject(userId, {
      name: cleanName,
      description: sanitizeString(description),
      category: sanitizeString(category) || 'Coding Projects',
      instructions: sanitizeString(instructions),
      notes: sanitizeString(notes),
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 500 })
  }
}
