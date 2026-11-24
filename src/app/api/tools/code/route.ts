import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/registry'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { rateLimiter, getClientIp } from '@/lib/security/rateLimiter'
import { sanitizeString } from '@/lib/security/sanitize'
import { sanitizeAIInput, scrubExfiltration } from '@/lib/security/waf'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = user.id

    const clientIp = getClientIp(req)
    const rateCheck = rateLimiter.check(`tool_code_${userId}_${clientIp}`, 30, 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'AI request rate limit reached. Please wait a few moments.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const {
      action = 'generate',
      prompt: rawPrompt,
      code: rawCode,
      language = 'typescript',
      targetLanguage,
      model,
    } = body

    const prompt = sanitizeAIInput(sanitizeString(rawPrompt))
    const code = sanitizeString(rawCode)

    if (!prompt && !code) {
      return NextResponse.json({ error: 'Prompt or code is required' }, { status: 400 })
    }

    let promptText = ''
    switch (action) {
      case 'explain':
        promptText = `Explain the following ${language} code in depth. Detail its algorithmic complexity, design patterns, and line-by-line execution:\n\n\`\`\`${language}\n${code}\n\`\`\``
        break
      case 'debug':
        promptText = `Identify all bugs, security vulnerabilities, edge-case failures, and memory leaks in this ${language} code. Provide fixed code and an itemized explanation of fixes:\n\n\`\`\`${language}\n${code}\n\`\`\``
        break
      case 'optimize':
        promptText = `Optimize this ${language} code for maximum time and space efficiency. Compare the Big-O complexity before and after, and explain the optimization rationale:\n\n\`\`\`${language}\n${code}\n\`\`\``
        break
      case 'convert':
        promptText = `Convert the following ${language} code cleanly into ${targetLanguage || 'Python'}. Maintain idiomatic patterns and equivalent type safety:\n\n\`\`\`${language}\n${code}\n\`\`\``
        break
      case 'structure':
        promptText = `Design a comprehensive, production-grade project directory structure and architecture for: "${prompt}". Include file names, purpose, tech stack recommendations, and configuration files.`
        break
      case 'generate':
      default:
        promptText = `Generate production-ready, clean, secure, and fully documented ${language} code for the following specification:\n"${prompt}". Include usage examples and error handling.`
        break
    }

    const provider = getAIProvider(model)
    const result = await provider.generateText(
      [{ role: 'user', content: promptText }],
      {
        model,
        systemPrompt: 'You are Atlas Code Architect, an elite software engineer. Respond with clean code, clear markdown explanations, and structured analysis.',
      }
    )

    const { scrubbed } = scrubExfiltration(result)
    db.logToolUsage(userId, 'Code Generator', Math.floor(result.length / 4) + 150, 'success')

    return NextResponse.json({ result: scrubbed, action, language })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process code request' }, { status: 500 })
  }
}
