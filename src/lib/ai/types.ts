export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AIModelMeta {
  id: string
  name: string
  provider: 'google' | 'openai' | 'anthropic' | 'meta' | 'local'
  description: string
  contextWindow: string
  badge?: string
  isAvailable: boolean
  isDefault?: boolean
}

export interface AIProvider {
  name: string
  generateText(messages: ChatMessage[], options?: ChatOptions): Promise<string>
  streamText(
    messages: ChatMessage[],
    options: ChatOptions,
    onChunk: (chunk: string) => void
  ): Promise<string>
}
