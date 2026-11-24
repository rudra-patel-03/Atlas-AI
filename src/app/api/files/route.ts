import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { sanitizeFilename } from '@/lib/security/sanitize'

// Restricted executable, script, and system payload extensions for upload safety
const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.msi', '.vbs', '.scr', '.ps1', '.pif',
  '.dll', '.so', '.dylib', '.com', '.jar', '.vbe', '.wsf', '.hta', '.cpl',
  '.reg', '.inf', '.bin', '.cgi', '.pyc', '.php', '.asp', '.jsp'
]

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId') || undefined

  const files = db.getFiles(userId, projectId)
  return NextResponse.json({ files })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    // Parse form data or json
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validation: 25MB max
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 25MB limit' }, { status: 400 })
    }

    // 🛡️ Security: Sanitize file name & reject dangerous executable binaries
    const safeName = sanitizeFilename(file.name)
    const lowerName = safeName.toLowerCase()
    const hasForbiddenExt = FORBIDDEN_EXTENSIONS.some(ext => lowerName.endsWith(ext))
    if (hasForbiddenExt) {
      return NextResponse.json(
        { error: 'Executable and system script files are forbidden for security reasons.' },
        { status: 400 }
      )
    }

    const newRecord = db.createFile(userId, {
      name: safeName,
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: `/uploads/${safeName}`,
      projectId: projectId || undefined,
    })

    db.logToolUsage(userId, 'File Storage', Math.floor(file.size / 1024), 'success')

    return NextResponse.json({ file: newRecord }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 })
  }
}
