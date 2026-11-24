import { NextRequest, NextResponse } from 'next/server'
import { db, hashPassword } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { sanitizeString, validatePasswordStrength } from '@/lib/security/sanitize'
import { verifyPassword } from '@/lib/security/crypto'
import { recordSecurityEvent } from '@/lib/security/audit'
import { getClientIp } from '@/lib/security/rateLimiter'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const settings = db.getSettings(userId)

  // 🛡️ Data Privacy: Never expose passwordHash or internal cryptographic secrets
  const safeUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  }

  return NextResponse.json({ settings, user: safeUser })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id
    const clientIp = getClientIp(req)

    const body = await req.json()

    // Handle Password Change with strict validation
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 })
      }

      const isCurrentValid = verifyPassword(body.currentPassword, user.passwordHash)
      if (!isCurrentValid) {
        recordSecurityEvent({
          eventType: 'AUTH_FAILURE',
          severity: 'HIGH',
          ip: clientIp,
          userId,
          endpoint: '/api/settings',
          details: `Password change failed: incorrect current password for @${user.username}`,
        })

        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      const strength = validatePasswordStrength(body.newPassword)
      if (!strength.valid) {
        return NextResponse.json({ error: strength.reason || 'Password does not meet requirements' }, { status: 400 })
      }

      db.updateUser(userId, {
        passwordHash: hashPassword(body.newPassword),
      })

      recordSecurityEvent({
        eventType: 'PASSWORD_RESET',
        severity: 'LOW',
        ip: clientIp,
        userId,
        endpoint: '/api/settings',
        details: `Password updated successfully via Settings by @${user.username}`,
      })
    }

    const { theme, defaultModel, language, notifications } = body
    const safeSettings: any = {}
    if (theme) safeSettings.theme = theme
    if (defaultModel) safeSettings.defaultModel = defaultModel
    if (language) safeSettings.language = language
    if (typeof notifications === 'boolean') safeSettings.notifications = notifications

    const updated = db.updateSettings(userId, safeSettings)

    // Update user profile fields if sent
    if (body.name || body.bio) {
      db.updateUser(userId, {
        name: sanitizeString(body.name) || user.name,
        bio: sanitizeString(body.bio) || user.bio,
      })
    }

    return NextResponse.json({ success: true, settings: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 })
  }
}
