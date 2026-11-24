'use client'

import React, { useState } from 'react'
import {
  FileText,
  Upload,
  Search,
  Sparkles,
  HelpCircle,
  Table,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DocumentAssistantPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [documentName, setDocumentName] = useState('Atlas_Technical_Report.txt')
  const [documentContent, setDocumentContent] = useState(`ATLAS AI SPECIFICATION SUMMARY
Product Name: ATLAS AI
Tagline: Chat. Create. Code. Learn.
Official Instagram: @atlas.ai.tools
Security Tier: Enterprise-grade PostgreSQL with Row Level Security (RLS).
Primary Engine: Google Gemini 2.0 Flash multimodal model.
Capabilities: 13 functional tools, custom AI agents, isolated project workspaces, persistent file storage.`)
  const [mode, setMode] = useState<'qa' | 'summarize' | 'extract' | 'notes'>('qa')
  const [question, setQuestion] = useState('What security architecture is implemented in this document?')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setDocumentName(file.name)
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      setDocumentContent(text || 'Document uploaded.')
    }
    reader.readAsText(file)
  }

  const handleAnalyze = async () => {
    if (!documentContent.trim()) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/tools/doc-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName,
          documentContent,
          question,
          mode,
        }),
      })

      const data = await res.json()
      if (data.result) {
        setResult(data.result)
      } else if (data.error) {
        setResult(`⚠️ ${data.error}`)
      }
    } catch {
      setResult('Failed to analyze document.')
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
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
                <FileText className="w-6 h-6 text-cyan-400" />
                <span>Atlas Document Intelligence Assistant</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Deep document auditing, automated clause extraction, contextual Q&A, and executive digests
              </p>
            </div>

            {/* Mode Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-atlas-900 border border-slate-800">
              {[
                { id: 'qa', label: 'Ask Q&A', icon: HelpCircle },
                { id: 'summarize', label: 'Summarize', icon: Sparkles },
                { id: 'extract', label: 'Extract Data Table', icon: Table },
                { id: 'notes', label: 'Generate Notes', icon: BookOpen },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    mode === tab.id
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls & File Upload (6 cols) */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Document Source
                </span>
                <label className="px-3 py-1.5 rounded-xl bg-atlas-800 hover:bg-atlas-700 border border-slate-700 text-xs font-semibold text-cyan-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File (TXT, PDF, DOCX)</span>
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx,.md,.csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-2.5 rounded-xl bg-atlas-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-white truncate max-w-xs">{documentName}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {documentContent.length} chars
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Preview / Plaintext Content
                </label>
                <textarea
                  rows={8}
                  value={documentContent}
                  onChange={e => setDocumentContent(e.target.value)}
                  placeholder="Paste or review raw document text here..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
                />
              </div>

              {mode === 'qa' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Question Regarding This Document
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="e.g. What are the key termination conditions in section 4?"
                    className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !documentContent.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Document Clauses...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Execute {mode.toUpperCase()} Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Output Area (6 cols) */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 shadow-xl flex flex-col justify-between min-h-[460px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Intelligence Analysis Output
                  </span>
                  {result && (
                    <button
                      onClick={copyResult}
                      className="px-2.5 py-1 rounded-lg bg-atlas-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <p className="text-xs text-cyan-300 font-mono">
                      Extracting entities & cross-referencing context...
                    </p>
                  </div>
                ) : result ? (
                  <div className="p-4 rounded-xl bg-atlas-950 border border-slate-800 max-h-[460px] overflow-y-auto leading-relaxed text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-sans">
                    {result}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs space-y-2">
                    <FileText className="w-10 h-10 text-slate-700" />
                    <p>Analysis, answers, metrics, and structured tables will appear here.</p>
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
