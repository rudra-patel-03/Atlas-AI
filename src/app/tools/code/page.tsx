'use client'

import React, { useState } from 'react'
import {
  Code2,
  Play,
  Copy,
  Check,
  Bug,
  Zap,
  RefreshCw,
  FolderTree,
  FileCode,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { CodeBlock } from '@/components/chat/CodeBlock'

export default function CodeGeneratorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [action, setAction] = useState<'generate' | 'explain' | 'debug' | 'optimize' | 'convert' | 'structure'>('generate')
  const [language, setLanguage] = useState('typescript')
  const [targetLanguage, setTargetLanguage] = useState('python')
  const [prompt, setPrompt] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const languages = [
    'typescript',
    'python',
    'javascript',
    'java',
    'c',
    'cpp',
    'go',
    'rust',
    'sql',
    'html',
    'css',
    'php',
    'bash',
  ]

  const handleExecute = async () => {
    if (!prompt.trim() && !inputCode.trim()) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/tools/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          prompt,
          code: inputCode,
          language,
          targetLanguage,
        }),
      })

      const data = await res.json()
      if (data.result) {
        setResult(data.result)
      } else {
        setResult(data.error ? `⚠️ ${data.error}` : 'Error generating code. Please try again.')
      }
    } catch {
      setResult('Network error while synthesizing code.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResult = () => {
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Code2 className="w-6 h-6 text-cyan-400" />
                <span>Atlas Code Architect & Generator</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Full-stack code generation, debugging, complexity optimization, and structural scaffolding
              </p>
            </div>

            {/* Action Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-atlas-900 border border-slate-800">
              {[
                { id: 'generate', label: 'Generate', icon: Sparkles },
                { id: 'explain', label: 'Explain', icon: FileCode },
                { id: 'debug', label: 'Debug', icon: Bug },
                { id: 'optimize', label: 'Optimize', icon: Zap },
                { id: 'convert', label: 'Convert', icon: RefreshCw },
                { id: 'structure', label: 'Project Scaffolding', icon: FolderTree },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAction(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    action === tab.id
                      ? 'bg-blue-600 text-white shadow-neon-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Work Area: Input & Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Panel */}
            <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Configuration & Input
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-atlas-950 border border-slate-800 text-xs text-cyan-400 font-mono focus:outline-none"
                  >
                    {languages.map(l => (
                      <option key={l} value={l}>
                        {l.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {action === 'convert' && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={targetLanguage}
                        onChange={e => setTargetLanguage(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-atlas-950 border border-slate-800 text-xs text-purple-400 font-mono focus:outline-none"
                      >
                        {languages.map(l => (
                          <option key={l} value={l}>
                            {l.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {action === 'generate' || action === 'structure' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Specification / Prompt
                  </label>
                  <textarea
                    rows={8}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={
                      action === 'structure'
                        ? 'e.g. Full-stack SaaS application with Next.js App Router, Supabase Auth, PostgreSQL, Stripe billing, and modular AI pipeline.'
                        : 'e.g. Build an asynchronous event bus in TypeScript with type-safe subscriptions, retry backoff, and dead-letter queue.'
                    }
                    className="w-full p-3.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Input Code to {action}
                    </label>
                    <textarea
                      rows={8}
                      value={inputCode}
                      onChange={e => setInputCode(e.target.value)}
                      placeholder={`// Paste your ${language} code here...`}
                      className="w-full p-3.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
                    />
                  </div>

                  {action === 'debug' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Optional Error Message / Expected Behavior
                      </label>
                      <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="e.g. Throws TypeError: Cannot read property of undefined on line 42"
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleExecute}
                disabled={loading || (!prompt.trim() && !inputCode.trim())}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm hover:shadow-neon-blue transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Synthesizing Code...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Execute {action.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Output Panel */}
            <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 flex flex-col justify-between shadow-xl min-h-[420px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Generated Code Output</span>
                  </span>

                  {result && (
                    <button
                      onClick={handleCopyResult}
                      className="px-2.5 py-1 rounded-lg bg-atlas-800 hover:bg-atlas-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
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
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <p className="text-xs text-cyan-300 font-mono">
                      Compiling AST & applying optimizations...
                    </p>
                  </div>
                ) : result ? (
                  <div className="max-h-[500px] overflow-y-auto pr-1">
                    <CodeBlock language={action === 'convert' ? targetLanguage : language} code={result} />
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs space-y-2">
                    <Code2 className="w-8 h-8 text-slate-600" />
                    <p>Generated code, documentation, and complexity analysis will appear here.</p>
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
