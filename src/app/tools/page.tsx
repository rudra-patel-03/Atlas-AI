'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Search,
  Code2,
  Image as ImageIcon,
  Video,
  Volume2,
  Mic,
  FileDown,
  FileText,
  AlignLeft,
  BookOpen,
  Globe2,
  Wand2,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function ToolsHubPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('All')

  const tools = [
    { id: 'code', name: 'Code Generator', desc: 'Synthesize algorithms, debug stack traces, optimize Big-O, convert languages, and scaffold projects.', icon: Code2, path: '/tools/code', category: 'Engineering' },
    { id: 'image', name: 'Image Generator', desc: 'High-res neural text-to-image studio supporting 6 artistic styles, negative prompts, and aspect ratios.', icon: ImageIcon, path: '/tools/image', category: 'Creative' },
    { id: 'research', name: 'Deep Research', desc: 'Multi-source empirical investigation engine. Isolates verified facts from inferences with source links.', icon: Search, path: '/tools/research', category: 'Intelligence' },
    { id: 'doc-assistant', name: 'Document Assistant', desc: 'Interact with PDF, DOCX, and TXT files. Extract metrics, ask questions, and detect contract clauses.', icon: FileText, path: '/tools/doc-assistant', category: 'Productivity' },
    { id: 'notes', name: 'Notes Generator', desc: 'Generate Cornell notes, active recall flashcards, and revision cheat-sheets for any subject.', icon: BookOpen, path: '/tools/notes', category: 'Education' },
    { id: 'summarizer', name: 'Summarizer', desc: 'Extract core takeaways, glossary tables, detailed executive briefs, or chapter-by-chapter breakdowns.', icon: AlignLeft, path: '/tools/summarizer', category: 'Productivity' },
    { id: 'translator', name: 'Polyglot Translator', desc: 'High-fidelity contextual translation between 30+ languages with auto language detection.', icon: Globe2, path: '/tools/translator', category: 'Global' },
    { id: 'prompt', name: 'Prompt Generator', desc: 'Craft optimized system instructions and prompt chains for coding, creative media, business, and research.', icon: Wand2, path: '/tools/prompt', category: 'Engineering' },
    { id: 'pdf', name: 'PDF Maker', desc: 'Live markdown-to-PDF visual layout editor with instant preview and client-side PDF download.', icon: FileDown, path: '/tools/pdf', category: 'Productivity' },
    { id: 'voice', name: 'Voice Maker', desc: 'Neural text-to-speech audio synthesis with custom pitch, cadence, and multi-voice controls.', icon: Volume2, path: '/tools/voice', category: 'Audio' },
    { id: 'voice-chat', name: 'Voice Chat', desc: 'Full conversational hands-free voice interface powered by Web Speech API recognition and audio playback.', icon: Mic, path: '/tools/voice-chat', category: 'Audio' },
    { id: 'video', name: 'Video Generator', desc: 'Text-to-video generation studio with prompt camera motion, duration, and aspect ratio configuration.', icon: Video, path: '/tools/video', category: 'Creative' },
    { id: 'chat', name: 'AI Chat', desc: 'Core multi-turn conversational reasoning interface with code highlighting and streaming tokens.', icon: Sparkles, path: '/chat', category: 'Core' },
  ]

  const categories = ['All', 'Engineering', 'Creative', 'Intelligence', 'Productivity', 'Education', 'Audio']

  const filtered = filter === 'All' ? tools : tools.filter(t => t.category === filter)

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
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">ATLAS AI Functional Suite</h1>
            <p className="text-sm text-slate-400">
              Select a specialized AI tool to accelerate your coding, research, writing, and creative workflow.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === cat
                    ? 'bg-blue-600 text-white shadow-neon-sm'
                    : 'bg-atlas-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-atlas-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(tool => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.id}
                  href={tool.path}
                  className="group p-6 rounded-2xl bg-atlas-900/80 hover:bg-atlas-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between hover:shadow-neon-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-blue-600/20 text-cyan-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-atlas-800 text-slate-400 border border-slate-700">
                        {tool.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-cyan-300">
                    <span>Launch Module</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
