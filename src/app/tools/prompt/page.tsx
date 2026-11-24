'use client'

import React, { useState } from 'react'
import {
  Wand2,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  RefreshCw,
  Layers,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function PromptGeneratorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [category, setCategory] = useState('Coding')
  const [topic, setTopic] = useState('')
  const [complexity, setComplexity] = useState('Advanced')
  const [tone, setTone] = useState('Professional & Structured')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const categories = [
    'AI Chat',
    'Coding',
    'Image Generation',
    'Video Generation',
    'Research',
    'Education',
    'Writing',
    'Business',
    'Marketing',
  ]

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/tools/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, topic, complexity, tone }),
      })
      const data = await res.json()
      if (data.result) {
        setResult(data.result)
      } else if (data.error) {
        setResult(`⚠️ ${data.error}`)
      }
    } catch {
      setResult('Failed to engineer prompts.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          } p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8`}
        >
          {/* Header */}
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-pink-400" />
              <span>Atlas Prompt Architect</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Construct high-impact, few-shot, and chain-of-thought prompts for 9 professional domains
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Prompt Domain Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                        category === cat
                          ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-neon-sm'
                          : 'bg-atlas-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Core Objective / Topic
                </label>
                <textarea
                  rows={4}
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Build an autonomous agent with persistent memory and web search tools in Next.js..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Complexity
                  </label>
                  <select
                    value={complexity}
                    onChange={e => setComplexity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced / Production</option>
                    <option value="Mastery">Mastery / SOTA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Persona Tone
                  </label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Professional & Structured">Professional & Structured</option>
                    <option value="Direct & Minimal">Direct & Minimal</option>
                    <option value="Creative & Evocative">Creative & Evocative</option>
                    <option value="Academic & Rigorous">Academic & Rigorous</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-40 shadow-neon-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Architecting Prompt Chains...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Engineer Prompts</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Output (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 shadow-xl flex flex-col justify-between min-h-[460px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Engineered Prompts
                  </span>
                  {result && (
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 rounded-lg bg-atlas-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
                    <p className="text-xs text-pink-300 font-mono">
                      Applying few-shot constraints and delimiter formatting...
                    </p>
                  </div>
                ) : result ? (
                  <div className="p-4 rounded-xl bg-atlas-950 border border-slate-800 max-h-[480px] overflow-y-auto leading-relaxed text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-sans">
                    {result}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs space-y-2">
                    <Wand2 className="w-10 h-10 text-slate-700" />
                    <p>Configured prompts with variable placeholders and system roles will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
