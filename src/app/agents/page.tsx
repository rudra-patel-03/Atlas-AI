'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bot,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Shield,
  Code2,
  BookOpen,
  Search,
  PenTool,
  FileText,
  Zap,
  Lock,
  MessageSquare,
  X,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

interface AIAgent {
  id: string
  name: string
  role: string
  description: string
  instructions: string
  avatar: string
  model: string
  category: string
  isDefault: boolean
}

export default function AgentsHubPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [filter, setFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)

  // New Agent Form State
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [category, setCategory] = useState('Engineering')
  const [avatar, setAvatar] = useState('⚡')
  const [model, setModel] = useState('gemini-2.0-flash')
  const [instructions, setInstructions] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      if (data.agents) setAgents(data.agents)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !instructions.trim()) return
    setCreating(true)

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          category,
          avatar,
          model,
          instructions,
          description,
        }),
      })

      const data = await res.json()
      if (data.agent) {
        setAgents(prev => [...prev, data.agent])
        setModalOpen(false)
        setName('')
        setRole('')
        setInstructions('')
        setDescription('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom agent?')) return
    await fetch(`/api/agents/${id}`, { method: 'DELETE' })
    fetchAgents()
  }

  const categories = ['All', 'Engineering', 'Education', 'Research', 'Creative', 'Productivity', 'Security']
  const filtered = filter === 'All' ? agents : agents.filter(a => a.category === filter)

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
                <Bot className="w-6 h-6 text-cyan-400" />
                <span>Autonomous AI Agents</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Deploy specialized domain personas equipped with distinct instructions, models, and reasoning vectors
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Agent</span>
            </button>
          </div>

          {/* Filter Pills */}
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

          {/* Agents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(agent => (
              <div
                key={agent.id}
                className="p-6 rounded-2xl bg-atlas-900/80 hover:bg-atlas-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl hover:shadow-neon-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-2xl shadow-sm">
                      {agent.avatar}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-atlas-950 text-cyan-400 border border-cyan-800/40">
                        {agent.category}
                      </span>
                      {!agent.isDefault && (
                        <button
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                          title="Delete Custom Agent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-400 mt-0.5">
                      {agent.role}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Engine: {agent.model}
                  </span>

                  <Link
                    href={`/chat?agent=${agent.id}&prompt=${encodeURIComponent(`Act as ${agent.name}. ${agent.instructions}`)}`}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-xs font-semibold text-cyan-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Launch Chat</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Create Custom Agent Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div
                className="w-full max-w-xl rounded-2xl border border-slate-700 bg-atlas-900 shadow-2xl p-6 overflow-hidden space-y-4"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Configure Custom AI Agent</span>
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateAgent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Next.js Optimizer"
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Role Title
                      </label>
                      <input
                        type="text"
                        required
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Architect"
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Avatar Emoji
                      </label>
                      <input
                        type="text"
                        value={avatar}
                        onChange={e => setAvatar(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-center text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Education">Education</option>
                        <option value="Research">Research</option>
                        <option value="Creative">Creative</option>
                        <option value="Productivity">Productivity</option>
                        <option value="Security">Security</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        AI Engine
                      </label>
                      <select
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-cyan-400 focus:outline-none font-mono"
                      >
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gpt-4o">GPT-4o</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. Refactors components into idiomatic React Server Components..."
                      className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      System Instructions / Persona Prompt
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      placeholder="You are an expert in... Follow strict type-checking and provide benchmark analysis..."
                      className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-6 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all"
                    >
                      {creating ? 'Saving...' : 'Deploy Agent'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
