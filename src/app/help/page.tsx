'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  BookOpen,
  Shield,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Terminal,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function HelpPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: 'Which AI models are available and how do I select them?',
      a: 'ATLAS AI integrates Google Gemini models (Gemini 2.0 Flash, Gemini 1.5 Pro, and Gemini 1.5 Flash), OpenAI GPT-4o, and the built-in ATLAS Core Live Engine. Once signed in, you can switch your active reasoning model from the header model selector. If an external provider key is not configured in the server environment, a clear configuration notice is shown.',
    },
    {
      q: 'Where are API keys configured and are they exposed to the frontend?',
      a: 'Provider keys (GEMINI_API_KEY, OPENAI_API_KEY) are stored exclusively in server-side environment variables (.env.local or hosting platform secrets). They are never bundled into client-side code or exposed in browser JavaScript. All AI responses also pass through an automated Data Loss Prevention (DLP) engine to prevent accidental secret leakage.',
    },
    {
      q: 'Are my project files and private chats shared with anyone?',
      a: 'No. ATLAS AI enforces strict server-side tenant isolation tied to your authenticated cryptographic session. Every chat, project, note, and file query is strictly scoped and verified by your user ID on the server, preventing cross-user data access.',
    },
    {
      q: 'Why do chat and AI tools require sign in?',
      a: 'To safeguard user data, enforce audit logging, and maintain individual workspace history, AI generation and tools require an authenticated user session. Guests can explore the dashboard and documentation before creating an account.',
    },
    {
      q: 'How can I follow official ATLAS AI updates?',
      a: 'Follow our official channel @atlas.ai.tools for platform tutorials, prompt engineering tips, and architectural releases.',
    },
  ]

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          } p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8`}
        >
          {/* Header */}
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-cyan-400" />
              <span>ATLAS AI Documentation & Support</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Platform guides, shortcut cheatsheets, API configuration, and customer assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Official Community</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect directly with the ATLAS AI creator team, submit feature requests, and explore community custom agents.
              </p>
              <a
                href="https://instagram.com/atlas.ai.tools"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300 pt-1"
              >
                <span>Instagram: @atlas.ai.tools</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-xs font-mono pt-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Ctrl + K</span>
                  <span className="text-cyan-400">Global Search</span>
                </div>
                <div className="flex justify-between">
                  <span>Enter</span>
                  <span className="text-cyan-400">Send Message</span>
                </div>
                <div className="flex justify-between">
                  <span>Shift + Enter</span>
                  <span className="text-cyan-400">Newline in Prompt</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Frequently Answered Inquiries
            </h3>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-atlas-900 border border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:text-cyan-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
