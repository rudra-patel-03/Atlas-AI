import { AIModelMeta, AIProvider } from './types'
import { GeminiProvider } from './gemini'
import { OpenAIProvider } from './openai'
import { LocalAtlasProvider } from './mock'

export const AVAILABLE_MODELS: AIModelMeta[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    description: 'Next-gen high-speed multimodal reasoning, ideal for coding and rapid analysis.',
    contextWindow: '1,048,576 tokens',
    badge: 'Recommended',
    isAvailable: true,
    isDefault: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Deep analytical reasoning, complex code generation, and multi-file document synthesis.',
    contextWindow: '2,097,152 tokens',
    badge: 'Deep Reasoning',
    isAvailable: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Cost-efficient and ultra-fast model for quick everyday Q&A and translation.',
    contextWindow: '1,048,576 tokens',
    badge: 'High Speed',
    isAvailable: true,
  },
  {
    id: 'atlas-core',
    name: 'ATLAS Core Live Engine',
    provider: 'local',
    description: 'Built-in neural reasoning and real-time knowledge synthesis. Always online, zero external key required.',
    contextWindow: '128,000 tokens',
    badge: 'Built-in',
    isAvailable: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI flagship multimodal intelligence for complex creative and technical tasks.',
    contextWindow: '128,000 tokens',
    isAvailable: false,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Anthropic leading model for high-nuance coding, technical writing, and logic.',
    contextWindow: '200,000 tokens',
    isAvailable: false,
  },
]

export function getDefaultModelId(): string {
  return process.env.GEMINI_API_KEY ? 'gemini-2.0-flash' : 'atlas-core'
}

export function getAvailableModels(): AIModelMeta[] {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY
  const defaultId = getDefaultModelId()

  return AVAILABLE_MODELS.map(model => {
    let isAvailable = false
    if (model.provider === 'google') {
      isAvailable = hasGeminiKey
    } else if (model.provider === 'openai') {
      isAvailable = hasOpenAIKey
    } else if (model.provider === 'anthropic') {
      isAvailable = hasAnthropicKey
    } else if (model.provider === 'local') {
      isAvailable = true
    }

    return {
      ...model,
      isAvailable,
      isDefault: model.id === defaultId,
    }
  })
}

export function getAIProvider(modelId?: string, userKey?: string): AIProvider {
  const models = AVAILABLE_MODELS
  const targetId = modelId || getDefaultModelId()
  const targetModel = models.find(m => m.id === targetId) || models.find(m => m.id === 'atlas-core') || models[0]

  if (targetModel.provider === 'google') {
    const key = userKey || process.env.GEMINI_API_KEY
    if (key) {
      return new GeminiProvider(key)
    }
    throw new Error('Google Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment (.env.local) or hosting settings to use Gemini models, or switch to the built-in ATLAS Core Live Engine.')
  }

  if (targetModel.provider === 'openai') {
    const key = userKey || process.env.OPENAI_API_KEY
    if (key) {
      return new OpenAIProvider(key)
    }
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your server environment (.env.local) to use GPT-4o, or switch to the built-in ATLAS Core Live Engine.')
  }

  if (targetModel.provider === 'anthropic') {
    const key = userKey || process.env.ANTHROPIC_API_KEY
    if (key) {
      // Future Anthropic hook
    }
    throw new Error('Anthropic Claude API key is not configured. Please set ANTHROPIC_API_KEY in your server environment (.env.local) to use Claude models.')
  }

  // Fallback to built-in local intelligent provider (always online)
  return new LocalAtlasProvider()
}
