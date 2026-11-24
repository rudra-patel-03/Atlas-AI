import { cookies } from 'next/headers'
import { db, hashPassword } from '@/lib/db'
import { User } from '@/lib/db/schema'
import { timingSafeEqual } from '@/lib/security/crypto'

const SESSION_COOKIE = 'atlas_session_token'
const SECRET = process.env.JWT_SECRET || 'atlas_ai_default_secret_key_32_chars'

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: 'user' | 'admin'
  expiresAt: number
}

// Simple signed token generator
export function createToken(user: User): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const crypto = require('crypto')
  const signature = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [encoded, signature] = token.split('.')
    if (!encoded || !signature) return null

    const crypto = require('crypto')
    const expectedSig = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url')
    if (!timingSafeEqual(signature, expectedSig)) return null

    const json = Buffer.from(encoded, 'base64url').toString('utf-8')
    const payload = JSON.parse(json) as SessionPayload
    if (Date.now() > payload.expiresAt) return null

    return payload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = verifyToken(token)
  if (!session) return null

  const user = db.findUserById(session.userId)
  return user || null
}

export { SESSION_COOKIE }
