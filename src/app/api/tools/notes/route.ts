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
    const { content, topic, text, prompt, format = 'study_notes', subject, model } = body
    const noteContent = content || topic || text || prompt

    if (!noteContent) {
      return NextResponse.json({ error: 'Content or topic is required' }, { status: 400 })
    }

    let instruction = ''
    switch (format) {
      case 'revision':
        instruction = 'Create a high-yield, bulleted revision cheat-sheet. Highlight mnemonic devices, essential formulas, high-probability test concepts, and quick facts.'
        break
      case 'flashcards':
        instruction = 'Generate 8-10 high-impact active recall flashcards in structured format: "Q: [Question]" followed by "A: [Concise Answer]". Include both conceptual and applied problems.'
        break
      case 'qa':
        instruction = 'Formulate 5 top examination-grade Questions and detailed step-by-step Answers with conceptual breakdowns and common misconceptions.'
        break
      case 'study_notes':
      default:
        instruction = 'Generate structured study notes using the Cornell Note-Taking method. Include Core Cue Questions on the left, Detailed Notes with bold concepts in the center, and a 2-sentence Summary at the bottom.'
        break
    }

    const provider = getAIProvider(model)
    const result = await provider.generateText(
      [{ role: 'user', content: `${instruction}\nSubject: ${subject || 'General'}\n\nMaterial:\n"""\n${noteContent}\n"""` }],
      {
        model,
        systemPrompt: 'You are Atlas Academic Mentor. Provide educational study materials with clear formatting, bold key terms, and active recall elements.',
      }
    )

    const { scrubbed } = scrubExfiltration(result)
    db.logToolUsage(userId, 'Notes Generator', Math.floor(scrubbed.length / 4) + 120, 'success')

    return NextResponse.json({ result: scrubbed, format, subject })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Notes generation failed' }, { status: 500 })
  }
}
