import { AIProvider, ChatMessage, ChatOptions } from './types'

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI'
  private apiKey: string | null = null

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || null
  }

  public isConfigured(): boolean {
    return !!this.apiKey
  }

  async generateText(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment.')
    }

    const systemPrompt = options?.systemPrompt || 'You are ATLAS AI, an intelligent workspace companion.'
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages: formattedMessages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI API error: ${err}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  async streamText(
    messages: ChatMessage[],
    options: ChatOptions,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    // If OpenAI streaming is requested
    const text = await this.generateText(messages, options)
    // Emit in words for streaming feel
    const words = text.split(' ')
    for (const w of words) {
      onChunk(w + ' ')
      await new Promise(r => setTimeout(r, 20))
    }
    return text
  }
}
