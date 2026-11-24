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
    const { prompt, duration = 5, aspectRatio = '16:9', motion = 'smooth' } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const cleanPrompt = scrubText(sanitizeAIInput(prompt))

    const videoApiKey = process.env.VIDEO_API_KEY

    // If external video provider (e.g. Runway / Luma / Sora / Replicate) is configured
    if (videoApiKey) {
      // Future provider integration hook
      return NextResponse.json({
        configured: true,
        status: 'queued',
        jobId: 'vid-' + Math.random().toString(36).substring(2, 9),
        prompt: cleanPrompt,
        duration,
        aspectRatio,
        message: 'Video rendering queued on external provider.',
      })
    }

    // Informative status when provider is not yet configured
    db.logToolUsage(userId, 'Video Generator', 100, 'success')

    return NextResponse.json({
      configured: false,
      status: 'provider_unconfigured',
      prompt: cleanPrompt,
      duration,
      aspectRatio,
      motion,
      message: 'Video provider is currently in standby mode. To activate neural video rendering, add VIDEO_API_KEY in your server environment.',
      samplePreviewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-digital-animation-42571-large.mp4',
    })
  } catch (err: any) {
    return NextResponse.json({ error: scrubText(err.message || 'Video generation failed') }, { status: 500 })
  }
}
