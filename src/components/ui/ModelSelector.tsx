'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, Check, Lock, Cpu } from 'lucide-react'

export interface ModelOption {
  id: string
  name: string
  provider: 'google' | 'openai' | 'anthropic' | 'meta' | 'local'
  description: string
  contextWindow: string
  badge?: string
  isAvailable: boolean
  isDefault?: boolean
}

interface ModelSelectorProps {
  currentModel: string
  onSelectModel: (modelId: string) => void
  compact?: boolean
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  onSelectModel,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [models, setModels] = useState<ModelOption[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/models')
        const data = await res.json()
        if (data.models) {
          setModels(data.models)
        }
      } catch (e) {
        console.error('Failed to fetch models', e)
      } finally {
        setLoading(false)
      }
    }
    fetchModels()

    fetch('/api/auth')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) setUser(d.user)
      })
      .catch(() => {})
  }, [])

  const selected = models.find(m => m.id === currentModel) || models[0] || {
    id: currentModel,
    name: currentModel,
    provider: 'google',
    description: 'Neural intelligence model',
    contextWindow: '1M tokens',
    isAvailable: true,
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-800 bg-atlas-900/80 hover:bg-atlas-800 hover:border-blue-500/40 text-slate-200 transition-all text-xs font-medium backdrop-blur-md shadow-sm shrink-0 ${
          compact ? 'px-2 py-1.5' : 'px-2.5 sm:px-3 py-1.5'
        }`}
        title="Select AI Model"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="font-semibold text-slate-100 truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none">
          {compact ? selected.name.split(' ')[0] : selected.name}
        </span>
        {!compact && selected.badge && (
          <span className="hidden xl:inline-block px-1.5 py-0.2 text-[9px] rounded bg-blue-950 text-blue-300 border border-blue-700/50">
            {selected.badge}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700/70 bg-atlas-900/95 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1.5 border-b border-slate-800/80 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Active Reasoning Engine
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Multi-Provider
              </span>
            </div>

            {/* Signed-Out User Notice */}
            {!user && (
              <div className="p-2.5 mb-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Sign In Required</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Model switching and AI features require an authenticated account.
                </p>
                <a
                  href="/auth/login"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-white underline pt-0.5"
                >
                  Sign in to activate models →
                </a>
              </div>
            )}

            <div className="space-y-1 max-h-72 overflow-y-auto">
              {models.map(model => {
                const isSelected = model.id === currentModel
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      if (!user) {
                        window.location.href = '/auth/login'
                        return
                      }
                      onSelectModel(model.id)
                      localStorage.setItem('atlas_preferred_model', model.id)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border border-blue-500/50 text-white'
                        : 'hover:bg-atlas-800/80 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white">
                          {model.name}
                        </span>
                        {model.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                            {model.badge}
                          </span>
                        )}
                        {!model.isAvailable && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Key Needed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {model.description}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Context: {model.contextWindow}
                      </span>
                    </div>

                    <div className="pt-0.5 shrink-0">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-cyan-400" />
                      ) : !model.isAvailable ? (
                        <span title="Provider key not configured in environment">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        </span>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 px-2 flex justify-between items-center">
              <span>Google Gemini / OpenAI</span>
              <a href="/settings" className="text-blue-400 hover:text-blue-300 underline">
                Configure Keys
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
