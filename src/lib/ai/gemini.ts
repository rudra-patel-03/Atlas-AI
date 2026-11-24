import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProvider, ChatMessage, ChatOptions } from './types'

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini'
  private client: GoogleGenerativeAI | null = null

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY
    if (key) {
      this.client = new GoogleGenerativeAI(key)
    }
  }

  public isConfigured(): boolean {
    return !!this.client
  }

  private mapModelName(modelId?: string): string {
    if (!modelId) return 'gemini-2.0-flash'
    if (modelId.includes('1.5-pro')) return 'gemini-1.5-pro'
    if (modelId.includes('1.5-flash')) return 'gemini-1.5-flash'
    if (modelId.includes('2.0-flash')) return 'gemini-2.0-flash'
    return modelId
  }

  async generateText(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your environment.')
    }

    const modelName = this.mapModelName(options?.model)
    const systemInstruction = options?.systemPrompt || 'You are ATLAS AI, an intelligent, professional AI workspace companion. Tagline: Chat. Create. Code. Learn. Provide concise, expert, structured, and helpful responses.'

    const model = this.client.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    })

    // Prepare contents
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 4096,
      },
    })

    const response = await result.response
    return response.text()
  }

  async streamText(
    messages: ChatMessage[],
    options: ChatOptions,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your environment.')
    }

    const modelName = this.mapModelName(options?.model)
    const systemInstruction = options?.systemPrompt || 'You are ATLAS AI, an intelligent, professional AI workspace companion. Tagline: Chat. Create. Code. Learn. Provide concise, expert, structured, and helpful responses.'

    const model = this.client.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    })

    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const result = await model.generateContentStream({
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 4096,
      },
    })

    let fullText = ''
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        fullText += text
        onChunk(text)
      }
    }

    return fullText
  }
}
