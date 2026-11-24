import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sanitizeAIInput, scrubText } from '@/lib/security/waf'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = user.id

    const body = await req.json()
    const { text, voice = 'Atlas Neural Male', language = 'en-US', speed = 1.0, pitch = 1.0 } = body

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const cleanText = scrubText(sanitizeAIInput(text))

    db.logToolUsage(userId, 'Voice Maker', Math.floor(cleanText.length / 5) + 50, 'success')

    // Return synthesized audio specs and Web Speech API payload
    return NextResponse.json({
      success: true,
      text: cleanText,
      voice,
      language,
      speed,
      pitch,
      durationEstimatedSec: Math.max(1, Math.round(cleanText.split(' ').length / 2.5)),
      // Return encoded audio stream info or client-side Web Speech trigger
      clientSynthesisReady: true,
    })
  } catch (err: any) {
    return NextResponse.json({ error: scrubText(err.message || 'Voice synthesis failed') }, { status: 500 })
  }
}
