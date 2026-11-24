import { NextResponse } from 'next/server'
import { getAvailableModels } from '@/lib/ai/registry'

export async function GET() {
  const models = getAvailableModels()
  const defaultModel =
    process.env.NEXT_PUBLIC_DEFAULT_MODEL ||
    (process.env.GEMINI_API_KEY ? 'gemini-2.0-flash' : 'atlas-core')

  return NextResponse.json({
    models,
    defaultModel,
    providers: {
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      local: true,
    },
  })
}
