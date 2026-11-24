'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Paperclip,
  ArrowUp,
  Bot,
  FolderGit2,
  ArrowRight,
  TrendingUp,
  Share2,
  MessageCircle,
  ExternalLink,
  Lock,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Info,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { CompulsoryAuthModal } from '@/components/auth/CompulsoryAuthModal'

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentModel, setCurrentModel] = useState('gemini-2.0-flash')
  const [promptInput, setPromptInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authRedirectTarget, setAuthRedirectTarget] = useState('/chat')
  const [authFeatureName, setAuthFeatureName] = useState('AI Chat & Tools')

  useEffect(() => {
    const savedModel = localStorage.getItem('atlas_preferred_model')
    if (savedModel) setCurrentModel(savedModel)

    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  // 13 Tool Cards specified in Section 5
  const toolCards = [
    { id: 'chat', name: 'AI Chat', desc: 'Real-time multi-turn reasoning with code highlighting and TTS', icon: Sparkles, path: '/chat', tag: 'Core', color: 'from-blue-600 to-cyan-500' },
    { id: 'research', name: 'Deep Research', desc: 'Synthesizes verified literature, separates facts from inferences', icon: Search, path: '/tools/research', tag: 'Research', color: 'from-cyan-600 to-blue-500' },
    { id: 'code', name: 'Code Generator', desc: 'Generate, debug, optimize, and convert across 20+ languages', icon: Code2, path: '/tools/code', tag: 'Engineering', color: 'from-blue-600 to-indigo-600' },
    { id: 'image', name: 'Image Generator', desc: 'Neural text-to-image engine with 6 artistic styles and ratios', icon: ImageIcon, path: '/tools/image', tag: 'Creative', color: 'from-indigo-600 to-purple-600' },
    { id: 'video', name: 'Video Generator', desc: 'Text-to-video generation with duration, camera, and aspect ratios', icon: Video, path: '/tools/video', tag: 'Studio', color: 'from-purple-600 to-pink-600' },
    { id: 'voice', name: 'Voice Maker', desc: 'Natural neural speech synthesis with multi-voice selection and audio export', icon: Volume2, path: '/tools/voice', tag: 'Audio', color: 'from-cyan-600 to-teal-500' },
    { id: 'voice-chat', name: 'Voice Chat', desc: 'Hands-free spoken conversations with live neural audio feedback', icon: Mic, path: '/tools/voice-chat', tag: 'Audio AI', color: 'from-teal-600 to-emerald-500' },
    { id: 'pdf', name: 'PDF Maker', desc: 'Create formatted documents and export production-ready PDFs', icon: FileDown, path: '/tools/pdf', tag: 'Documents', color: 'from-emerald-600 to-blue-600' },
    { id: 'doc-assistant', name: 'Document Assistant', desc: 'Audit, summarize, extract data, and Q&A with uploaded PDFs', icon: FileText, path: '/tools/doc-assistant', tag: 'Productivity', color: 'from-blue-500 to-cyan-600' },
    { id: 'summarizer', name: 'Summarizer', desc: 'High-density summaries, key points, glossary terms, chapters', icon: AlignLeft, path: '/tools/summarizer', tag: 'Productivity', color: 'from-cyan-500 to-blue-600' },
    { id: 'notes', name: 'Notes Generator', desc: 'Cornell study notes, active recall flashcards, and exam prep', icon: BookOpen, path: '/tools/notes', tag: 'Learning', color: 'from-blue-600 to-violet-600' },
    { id: 'translator', name: 'Translator', desc: 'Nuanced multilingual translation with auto-detection for 30+ languages', icon: Globe2, path: '/tools/translator', tag: 'Polyglot', color: 'from-violet-600 to-purple-600' },
    { id: 'prompt', name: 'Prompt Generator', desc: 'Architect professional prompts for coding, business, creative & video', icon: Wand2, path: '/tools/prompt', tag: 'Engineering', color: 'from-pink-600 to-rose-600' },
  ]

  const suggestedPrompts = [
    'Design a distributed rate-limiter in TypeScript with Redis',
    'Summarize recent breakthroughs in quantum variational algorithms',
    'Generate a Cornell note sheet on neural transformer architectures',
    'Create an 8K cyberpunk render of an orbital research station',
  ]

  const triggerAuthOrAction = (targetUrl: string, featureTitle: string) => {
    if (!user) {
      setAuthRedirectTarget(targetUrl)
      setAuthFeatureName(featureTitle)
      setShowAuthModal(true)
    } else {
      router.push(targetUrl)
    }
  }

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptInput.trim()) return

    // Pass prompt to chat page via sessionStorage
    sessionStorage.setItem('atlas_initial_prompt', promptInput)
    if (!user) {
      setAuthRedirectTarget('/chat')
      setAuthFeatureName('AI Chat')
      setShowAuthModal(true)
    } else {
      router.push('/chat')
    }
  }

  // Web Speech API Microphone toggle
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.')
      return
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setPromptInput(prev => (prev ? prev + ' ' + transcript : transcript))
      }

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentModel={currentModel}
        onSelectModel={m => setCurrentModel(m)}
      />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          } p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-10`}
        >
          {/* Welcome Header */}
          <div className="text-center sm:text-left space-y-2 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {user ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-cyan-300 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Workspace Active — {currentModel}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Guest Preview — Model: {currentModel}</span>
                </div>
              )}
              {!user && (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-semibold hover:border-cyan-400 transition-all shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Sign In Required for Chat & AI Tools →</span>
                </Link>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Welcome to ATLAS AI
              {user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              {user
                ? 'What would you like to build or explore today?'
                : 'Preview our AI capabilities below. Sign in to chat, build projects, or launch tools.'}
            </p>
          </div>

          {!user && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-cyan-950/50 border border-cyan-500/30 text-xs text-slate-300 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white block">Viewing in Public Guest Mode</span>
                  <span className="text-[11px] text-slate-400">Sign in to start conversations, generate code, and access all AI models.</span>
                </div>
              </div>
              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs transition-all shadow-neon-sm shrink-0 ml-3"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Central Input Box */}
          <div className="relative rounded-2xl bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-purple-600/20 p-0.5 shadow-2xl">
            <div className="rounded-2xl bg-atlas-900/95 border border-slate-800 p-4 backdrop-blur-xl">
              <form onSubmit={handleQuickSubmit} className="space-y-3">
                <textarea
                  rows={3}
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleQuickSubmit(e)
                    }
                  }}
                  placeholder="Ask ATLAS AI anything... (or press Shift+Enter for newline)"
                  className="w-full bg-transparent text-sm sm:text-base text-white focus:outline-none placeholder:text-slate-500 resize-none"
                />

                {selectedFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-700/60 text-xs text-cyan-300">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="ml-1 text-slate-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {/* Attachment Input */}
                    <label className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-atlas-800 cursor-pointer transition-colors" title="Attach file or document">
                      <Paperclip className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) setSelectedFile(e.target.files[0])
                        }}
                      />
                    </label>

                    {/* Microphone input (Web Speech) */}
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'text-slate-400 hover:text-cyan-300 hover:bg-atlas-800'
                      }`}
                      title={isListening ? 'Listening...' : 'Voice Input'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
                      Shift+Enter for newline
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!promptInput.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm transition-all flex items-center gap-2"
                  >
                    <span>Send Query</span>
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Suggested Prompt Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Suggested Prompts:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => {
                    setPromptInput(prompt)
                    sessionStorage.setItem('atlas_initial_prompt', prompt)
                    if (!user) {
                      setAuthRedirectTarget('/chat')
                      setAuthFeatureName('AI Chat')
                      setShowAuthModal(true)
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-atlas-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-atlas-800 text-xs text-slate-300 hover:text-white transition-all text-left shadow-sm"
                >
                  ⚡ {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigation: Agents & Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => triggerAuthOrAction('/agents', 'Autonomous AI Agents')}
              className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-atlas-900 border border-blue-800/40 hover:border-cyan-500/60 transition-all flex items-center justify-between group shadow-sm text-left w-full cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-600/20 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-300">
                    Explore Autonomous AI Agents
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    7 default assistants for Code, Study, Research, Writing & Cybersecurity
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => triggerAuthOrAction('/projects', 'Project Workspaces')}
              className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-atlas-900 border border-purple-800/40 hover:border-purple-500/60 transition-all flex items-center justify-between group shadow-sm text-left w-full cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <FolderGit2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-purple-300">
                    Project Workspaces
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Isolated college, coding, study, and research project environments
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* 13 Attractive AI Tool Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Dedicated AI Tools</h2>
                <p className="text-xs text-slate-400">Launch specialized functional modules</p>
              </div>
              <span className="text-xs font-mono text-cyan-400">13 Tools Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {toolCards.map(tool => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => triggerAuthOrAction(tool.path, tool.name)}
                    className="group p-5 rounded-2xl bg-atlas-900/80 hover:bg-atlas-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between hover:shadow-neon-sm text-left w-full cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-atlas-800 text-slate-400 border border-slate-700/60">
                          {tool.tag}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-cyan-300">
                      <span>{user ? 'Open Tool' : 'Sign In to Access'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Introduction to ATLAS AI Section */}
          <section className="mt-12 pt-8 border-t border-slate-800/80 space-y-8">
            <div className="relative rounded-3xl bg-gradient-to-b from-atlas-900/90 via-atlas-900/60 to-slate-950 border border-slate-800/80 p-6 sm:p-10 backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Background ambient neon glow effects */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Badge & Title */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wide uppercase">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Introduction to ATLAS AI — Complete Platform Overview</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Next-Generation Sovereign Intelligence & Autonomous Workspace
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
                    <strong className="text-cyan-400 font-semibold">ATLAS AI</strong> is an enterprise-grade, privacy-first artificial intelligence platform engineered for engineers, researchers, students, and creators. Combining multi-model neural orchestration, specialized functional tools, autonomous agents, and cryptographic tenant isolation, ATLAS AI provides an uncompromised productivity environment accessible across mobile, tablet, and desktop devices.
                  </p>
                </div>

                {/* 4 Feature Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-atlas-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">Multi-Model Engine</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Instant access to Google Gemini 2.0 Flash, Gemini 1.5 Pro, OpenAI GPT-4o, and our zero-key built-in <strong className="text-slate-300">ATLAS Core Live Engine</strong>.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-atlas-950/70 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">13 Specialized Tools</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Purpose-built tools for full-stack code synthesis, document synthesis, Cornell notes, flashcards, polyglot translation, and 8K image generation.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-atlas-950/70 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">Military-Grade Privacy</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      HMAC-SHA256 authenticated sessions, strict per-user database tenant isolation, server-side key security, and automatic DLP data scrubbing.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-atlas-950/70 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">Universal Responsive View</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Toggle seamlessly between multi-column Web View for widescreen productivity and streamlined Mobile View for fast touch-first navigation.
                    </p>
                  </div>
                </div>

                {/* Getting Started Guide */}
                <div className="pt-4 border-t border-slate-800/80">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>How to Get Started with ATLAS AI</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-atlas-950/50 border border-slate-800/90 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-cyan-300">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px] text-cyan-400 font-mono">1</span>
                        <span>Sign In or Create Account</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Register for a free account to unlock continuous chat history, secure project workspaces, and full AI execution rights.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-atlas-950/50 border border-slate-800/90 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-blue-300">
                        <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500/50 flex items-center justify-center text-[11px] text-blue-400 font-mono">2</span>
                        <span>Select Your Preferred Model</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Use the model selector in the top header. Choose ATLAS Core Live Engine for zero-configuration use, or configure API keys for Google Gemini and OpenAI.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-atlas-950/50 border border-slate-800/90 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-purple-300">
                        <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center text-[11px] text-purple-400 font-mono">3</span>
                        <span>Chat, Code & Build Projects</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Launch full-stack coding sessions, attach documents, generate images, or organize work into isolated project workspaces with zero data leakage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Links Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>System Status: Fully Operational</span>
                    <span className="text-slate-600">•</span>
                    <span>Admin: Atlas Reed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/help"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1"
                    >
                      <span>Read Documentation & FAQ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    {!user && (
                      <Link
                        href="/auth/signup"
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-sm"
                      >
                        Create Free Account
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <CompulsoryAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTarget={authRedirectTarget}
        featureName={authFeatureName}
        onSuccess={() => {
          fetch('/api/auth')
            .then(res => res.json())
            .then(data => {
              if (data.authenticated) setUser(data.user)
            })
            .catch(() => {})
        }}
      />
    </div>
  )
}
