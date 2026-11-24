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
    const { text, type = 'key_points', model } = body

    if (!text) {
      return NextResponse.json({ error: 'Text to summarize is required' }, { status: 400 })
    }

    let instruction = ''
    switch (type) {
      case 'short':
        instruction = 'Generate an ultra-concise, high-impact summary in 2-3 sentences capturing the core thesis and outcome.'
        break
      case 'detailed':
        instruction = 'Generate a comprehensive, structured executive summary with section headings, background context, key mechanics, and final conclusions.'
        break
      case 'terms':
        instruction = 'Extract all critical domain terminology, definitions, acronyms, and technical concepts into an alphabetized glossary table.'
        break
      case 'chapters':
        instruction = 'Break this document down chapter-by-chapter / section-by-section with timestamps/milestones and concise syntheses for each part.'
        break
      case 'key_points':
      default:
        instruction = 'Synthesize the content into bulleted key points, prioritizing actionable insights, empirical data, and major findings.'
        break
    }

    const provider = getAIProvider(model)
    const result = await provider.generateText(
      [{ role: 'user', content: `${instruction}\n\nDocument text:\n"""\n${text}\n"""` }],
      {
        model,
        systemPrompt: 'You are Atlas Document Synthesizer. Deliver clear, high-density, beautifully formatted summaries with markdown.',
      }
    )

    const { scrubbed } = scrubExfiltration(result)
    db.logToolUsage(userId, 'Summarizer', Math.floor(scrubbed.length / 4) + 100, 'success')

    return NextResponse.json({ result: scrubbed, type })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Summarization failed' }, { status: 500 })
  }
}
