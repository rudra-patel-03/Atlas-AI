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
    const { prompt, style = 'photorealistic', aspectRatio = '1:1', negativePrompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const cleanPrompt = sanitizeAIInput(prompt.trim())

    // Determine dimensions
    let width = 1024
    let height = 1024
    if (aspectRatio === '16:9') {
      width = 1280
      height = 720
    } else if (aspectRatio === '9:16') {
      width = 720
      height = 1280
    } else if (aspectRatio === '4:3') {
      width = 1024
      height = 768
    }

    // Enhance prompt with selected style aesthetic
    let enhancedPrompt = cleanPrompt
    const styleModifiers: Record<string, string> = {
      cyberpunk: 'cyberpunk style, neon electric blue and cyan glow, futuristic tech details, 8k resolution, octane render',
      photorealistic: 'photorealistic, ultra-detailed 8k photography, cinematic lighting, sharp focus, hyper-realistic',
      anime: 'masterpiece anime art style, Makoto Shinkai aesthetic, vibrant colors, detailed illustration',
      '3d-render': 'modern 3D octane render, stylized lighting, smooth materials, clay & glass accents, trendy tech design',
      cinematic: 'cinematic film still, 35mm photograph, anamorphic lens flare, moody atmospheric grading, award winning',
      minimalist: 'clean minimalist vector art, sleek lines, high contrast, elegant typography, award-winning graphic design',
    }

    if (styleModifiers[style]) {
      enhancedPrompt = `${enhancedPrompt}, ${styleModifiers[style]}`
    }

    if (negativePrompt) {
      const cleanNeg = sanitizeAIInput(negativePrompt)
      enhancedPrompt = `${enhancedPrompt}&negative=${encodeURIComponent(cleanNeg)}`
    }

    // Real generation using Pollinations AI (FLUX / Turbo neural engine)
    const seed = Math.floor(Math.random() * 1000000)
    const encodedPrompt = encodeURIComponent(enhancedPrompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`

    db.logToolUsage(userId, 'Image Generator', 350, 'success')

    return NextResponse.json({
      success: true,
      imageUrl: scrubText(imageUrl),
      prompt: scrubText(cleanPrompt),
      enhancedPrompt: scrubText(enhancedPrompt),
      style,
      aspectRatio,
      dimensions: { width, height },
      createdAt: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: scrubText(err.message || 'Image generation failed') }, { status: 500 })
  }
}
