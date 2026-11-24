import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { getAIProvider } from '@/lib/ai/registry'
import { ChatMessage } from '@/lib/ai/types'
import { rateLimiter, getClientIp } from '@/lib/security/rateLimiter'
import { sanitizeString } from '@/lib/security/sanitize'
import { sanitizeAIInput, scrubExfiltration } from '@/lib/security/waf'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 })
    }
    const userId = user.id

    // Rate Limiting on AI generation
    const clientIp = getClientIp(req)
    const rateCheck = rateLimiter.check(`chat_${userId}_${clientIp}`, 30, 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'AI request rate limit reached. Please wait a few moments.' },
        { status: 429, headers: { 'Retry-After': Math.ceil(rateCheck.retryAfterMs / 1000).toString() } }
      )
    }

    const body = await req.json()
    const { chatId, message, model = 'gemini-2.0-flash', projectId, systemPrompt } = body

    const cleanMessage = sanitizeAIInput(sanitizeString(message))
    if (!cleanMessage) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Get or create chat
    let chat = chatId ? db.getChat(chatId, userId) : undefined
    if (!chat) {
      const title = cleanMessage.slice(0, 40) + (cleanMessage.length > 40 ? '...' : '')
      chat = db.createChat(userId, title, model, projectId)
    }

    // Save user message
    db.addMessage(chat.id, 'user', cleanMessage)

    // Load past conversation context (last 10 messages)
    const history = db.getMessages(chat.id)
    const contextMessages: ChatMessage[] = history.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }))

    // Get provider
    const provider = getAIProvider(model)

    // Log tool usage metrics
    db.logToolUsage(userId, 'AI Chat', Math.floor(message.length / 4) + 120, 'success')

    // Create streaming response
    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      async start(controller) {
        let fullAssistantReply = ''

        try {
          await provider.streamText(
            contextMessages,
            {
              model,
              systemPrompt: systemPrompt || (chat?.projectId ? `You are working inside project: ${chat.projectId}. Provide focused guidance.` : undefined),
            },
            chunk => {
              const { scrubbed } = scrubExfiltration(chunk)
              fullAssistantReply += scrubbed
              controller.enqueue(encoder.encode(scrubbed))
            }
          )

          // Persist completed assistant message with anti-exfiltration guarantee
          const { scrubbed: finalCleanReply } = scrubExfiltration(fullAssistantReply)
          db.addMessage(chat!.id, 'assistant', finalCleanReply)
          controller.close()
        } catch (streamErr: any) {
          const errMsg = `\n\n*[ATLAS AI Error: ${streamErr.message || 'Generation interrupted'}]*`
          controller.enqueue(encoder.encode(errMsg))
          db.addMessage(chat!.id, 'assistant', fullAssistantReply + errMsg)
          controller.close()
        }
      },
    })

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Chat-Id': chat.id,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process chat' }, { status: 500 })
  }
}
