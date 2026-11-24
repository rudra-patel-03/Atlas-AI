'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  Sparkles,
  Copy,
  Check,
  HelpCircle,
  Layers,
  RefreshCw,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function NotesGeneratorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('Computer Science')
  const [format, setFormat] = useState<'study_notes' | 'revision' | 'flashcards' | 'qa'>('study_notes')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const formats = [
    { id: 'study_notes', label: 'Cornell Study Notes', desc: 'Cue columns, structured notes & bottom summary' },
    { id: 'revision', label: 'Revision Cheat-Sheet', desc: 'High-yield formulas, quick facts & mnemonics' },
    { id: 'flashcards', label: 'Active Recall Cards', desc: 'Question & answer flashcard pairs' },
    { id: 'qa', label: 'Exam Q&A Breakdown', desc: 'Examination questions with full rubric answers' },
  ]

  const handleGenerate = async () => {
    if (!content.trim()) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/tools/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, subject, format }),
      })
      const data = await res.json()
      if (data.result) {
        setResult(data.result)
      } else if (data.error) {
        setResult(`⚠️ ${data.error}`)
      }
    } catch {
      setResult('Failed to generate study notes.')
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
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              <span>Atlas Academic Notes & Flashcard Generator</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Transform raw lectures, textbook passages, and syllabi into Cornell notes, flashcards, and revision kits
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Input (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Academic Subject / Course
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Distributed Systems, Organic Chemistry, Macroeconomics"
                  className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Learning Architecture
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {formats.map(fmt => (
                    <button
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id as any)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        format === fmt.id
                          ? 'bg-blue-600/30 border-cyan-500 text-white shadow-neon-sm'
                          : 'bg-atlas-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xs block text-slate-100">{fmt.label}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{fmt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Source Material / Lecture Transcript
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste lecture text, book chapters, or revision material here..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !content.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Structuring Learning Materials...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Study Notes</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Output (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 shadow-xl flex flex-col justify-between min-h-[460px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Structured Study Material
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
                      Formulating active recall triggers & Cornell cues...
                    </p>
                  </div>
                ) : result ? (
                  <div className="p-4 rounded-xl bg-atlas-950 border border-slate-800 max-h-[480px] overflow-y-auto leading-relaxed text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-sans">
                    {result}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs space-y-2">
                    <BookOpen className="w-10 h-10 text-slate-700" />
                    <p>Cornell notes, flashcards, and examination Q&A will appear here.</p>
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
