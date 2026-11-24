'use client'

import React, { useState } from 'react'
import {
  Globe2,
  ArrowRightLeft,
  Copy,
  Check,
  Volume2,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function TranslatorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [inputText, setInputText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('Spanish')
  const [tone, setTone] = useState('Natural')
  const [translatedText, setTranslatedText] = useState('')
  const [detectedLang, setDetectedLang] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const languages = [
    'Spanish',
    'French',
    'German',
    'Japanese',
    'Mandarin Chinese',
    'Hindi',
    'Arabic',
    'Russian',
    'Portuguese',
    'Italian',
    'Korean',
    'Dutch',
    'Turkish',
    'Swedish',
    'Polish',
    'Greek',
    'Hebrew',
    'Vietnamese',
    'Thai',
    'English',
  ]

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    setLoading(true)
    setTranslatedText('')

    try {
      const res = await fetch('/api/tools/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang,
          targetLang,
          tone,
        }),
      })

      const data = await res.json()
      if (data.error && !data.translatedText) {
        setTranslatedText(`⚠️ ${data.error}`)
      } else {
        setTranslatedText(data.translatedText || '')
        setDetectedLang(data.detectedLanguage || '')
        setNotes(data.notes || '')
      }
    } catch {
      setTranslatedText('Failed to translate.')
    } finally {
      setLoading(false)
    }
  }

  const swapLanguages = () => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang)
      setTargetLang('English')
    } else {
      const temp = sourceLang
      setSourceLang(targetLang)
      setTargetLang(temp)
    }
    const tempText = inputText
    setInputText(translatedText)
    setTranslatedText(tempText)
  }

  const copyResult = () => {
    navigator.clipboard.writeText(translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const speakTranslation = () => {
    if (!('speechSynthesis' in window) || !translatedText) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(translatedText)
    window.speechSynthesis.speak(utterance)
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
              <Globe2 className="w-6 h-6 text-violet-400" />
              <span>Atlas Polyglot Neural Translator</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Nuanced multilingual translation with idiomatic preservation, cultural context, and automatic language detection
            </p>
          </div>

          {/* Language Selection Bar */}
          <div className="p-4 rounded-2xl bg-atlas-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">From:</span>
                <select
                  value={sourceLang}
                  onChange={e => setSourceLang(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="auto">Auto Detect Language</option>
                  {languages.map(l => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={swapLanguages}
                className="p-2 rounded-xl bg-atlas-950 hover:bg-atlas-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Swap Languages"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">To:</span>
                <select
                  value={targetLang}
                  onChange={e => setTargetLang(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs font-semibold text-cyan-400 focus:outline-none"
                >
                  {languages.map(l => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Tone:</span>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="Natural">Natural / Conversational</option>
                <option value="Formal & Business">Formal & Business</option>
                <option value="Academic">Academic & Technical</option>
                <option value="Literary">Literary & Creative</option>
              </select>
            </div>
          </div>

          {/* Side-by-Side Translation Panes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Box */}
            <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                  <span>Source Text</span>
                  {detectedLang && (
                    <span className="text-cyan-400 font-mono">
                      Detected: {detectedLang}
                    </span>
                  )}
                </div>
                <textarea
                  rows={10}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Enter or paste text to translate..."
                  className="w-full pt-3 bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {inputText.length} characters
                </span>
                <button
                  onClick={handleTranslate}
                  disabled={loading || !inputText.trim()}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Translate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Target Box */}
            <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-cyan-300">{targetLang} Translation</span>
                  {translatedText && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={speakTranslation}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={copyResult}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Copy Translation"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-3 min-h-[220px] text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {loading ? (
                    <div className="h-44 flex items-center justify-center text-xs text-cyan-300 font-mono">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      Synthesizing idiomatic expressions...
                    </div>
                  ) : translatedText ? (
                    translatedText
                  ) : (
                    <span className="text-slate-500 text-xs">
                      Translated text will appear here.
                    </span>
                  )}
                </div>
              </div>

              {notes && (
                <div className="p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-slate-400 font-sans">
                  <strong className="text-cyan-400 font-mono block mb-0.5">Cultural & Pronunciation Notes:</strong>
                  {notes}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
