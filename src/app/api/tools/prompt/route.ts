import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/registry'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { scrubExfiltration } from '@/lib/security/waf'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = user.id

    const body = await req.json()
    const { category = 'Coding', topic, complexity = 'Advanced', tone = 'Professional', model } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const promptText = `Act as an expert prompt engineer. Construct 3 high-impact, professional, production-tested prompts optimized for ${category}.
Target Topic: "${topic}"
Complexity Level: ${complexity}
Tone: ${tone}

For each prompt, provide:
1. **Prompt Title**: Short descriptive title.
2. **System Role / Persona**: Who the AI should act as.
3. **Optimized Prompt**: The exact prompt text ready to copy-paste.
4. **Best Practices / Tips**: Why this prompt works and recommended variables to substitute.`

    const provider = getAIProvider(model)
    const result = await provider.generateText(
      [{ role: 'user', content: promptText }],
      {
        model,
        systemPrompt: 'You are Atlas Prompt Architect. Craft meticulously engineered, modular prompts using XML/Markdown tags, chain-of-thought instructions, and zero-shot/few-shot framing.',
      }
    )

    const { scrubbed } = scrubExfiltration(result)
    db.logToolUsage(userId, 'Prompt Generator', 220, 'success')

    return NextResponse.json({ result: scrubbed, category, topic })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Prompt generation failed' }, { status: 500 })
  }
}
