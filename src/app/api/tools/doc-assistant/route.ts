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
    const { documentName, documentContent, question, mode = 'qa', model = 'gemini-1.5-pro' } = body

    if (!documentContent) {
      return NextResponse.json({ error: 'Document content is required' }, { status: 400 })
    }

    let prompt = ''
    switch (mode) {
      case 'extract':
        prompt = `Extract all critical data points, metrics, dates, entities, and contractual terms from the document: "${documentName}". Present them as a structured table.`
        break
      case 'summarize':
        prompt = `Provide an exhaustive executive summary of the document: "${documentName}". Include key takeaways, risks, and conclusions.`
        break
      case 'notes':
        prompt = `Convert the core thesis and sections of "${documentName}" into actionable study and revision notes with key questions.`
        break
      case 'qa':
      default:
        prompt = `Based strictly on the content of the document: "${documentName}", answer the following user question:\n\nQuestion: "${question || 'What are the main insights and objectives of this document?'}"\n\nProvide relevant quotes or references to the document where applicable.`
        break
    }

    const provider = getAIProvider(model)
    const result = await provider.generateText(
      [
        {
          role: 'user',
          content: `${prompt}\n\nDocument Content:\n"""\n${documentContent.slice(0, 15000)}\n"""`,
        },
      ],
      {
        model,
        systemPrompt: 'You are Atlas Document Intelligence. Answer with high fidelity, direct citation of document text, and objective analysis.',
      }
    )

    const { scrubbed } = scrubExfiltration(result)
    db.logToolUsage(userId, 'Document Assistant', Math.floor(scrubbed.length / 4) + 180, 'success')

    return NextResponse.json({ result: scrubbed, mode, documentName })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Document analysis failed' }, { status: 500 })
  }
}
