import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/registry'
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
    const { text, sourceLang = 'auto', targetLang = 'Spanish', tone = 'Natural', model } = body

    if (!text) {
      return NextResponse.json({ error: 'Text to translate is required' }, { status: 400 })
    }

    const sanitizedText = sanitizeAIInput(text)

    const promptText = `Translate the following text into ${targetLang}.
Source Language: ${sourceLang === 'auto' ? 'Detect automatically' : sourceLang}
Target Language: ${targetLang}
Desired Tone: ${tone}

Formatting instructions:
First detect the language if source is auto, then provide the exact natural translation.
Return your response in clean JSON format:
{
  "detectedLanguage": "Name of source language",
  "translatedText": "The completed translation",
  "phoneticOrNotes": "Optional pronunciation guide or cultural context"
}

Text to translate:
"""
${sanitizedText}
"""`

    const provider = getAIProvider(model)
    const rawResult = await provider.generateText(
      [{ role: 'user', content: promptText }],
      {
        model,
        systemPrompt: 'You are Atlas Polyglot Translator. Translate with cultural nuance, idiomatic correctness, and return valid JSON.',
      }
    )

    db.logToolUsage(userId, 'Translator', Math.floor(rawResult.length / 4) + 80, 'success')

    // Parse JSON safely
    let parsed: any = null
    try {
      const match = rawResult.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0])
      }
    } catch {}

    const translatedText = scrubText(parsed?.translatedText || rawResult)
    const notes = scrubText(parsed?.phoneticOrNotes || '')

    return NextResponse.json({
      translatedText,
      detectedLanguage: parsed?.detectedLanguage || (sourceLang === 'auto' ? 'English' : sourceLang),
      notes,
      sourceLang,
      targetLang,
    })
  } catch (err: any) {
    return NextResponse.json({ error: scrubText(err.message || 'Translation failed') }, { status: 500 })
  }
}
