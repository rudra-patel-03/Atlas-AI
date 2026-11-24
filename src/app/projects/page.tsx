'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
  MessageSquare,
  FileText,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { formatDateTime } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description: string
  category: string
  instructions: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function ProjectsHubPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  // New Project Form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Coding Projects')
  const [instructions, setInstructions] = useState('')
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.projects) setProjects(data.projects)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category, instructions, notes }),
      })
      const data = await res.json()
      if (data.project) {
        setProjects(prev => [data.project, ...prev])
        setModalOpen(false)
        setName('')
        setDescription('')
        setInstructions('')
        setNotes('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project workspace?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    fetchProjects()
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
                <FolderGit2 className="w-6 h-6 text-cyan-400" />
                <span>Isolated Project Workspaces</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Maintain isolated contexts, project-specific files, private chats, and customized AI rules
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <div
                key={proj.id}
                className="p-6 rounded-2xl bg-atlas-900/80 hover:bg-atlas-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl hover:shadow-neon-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-cyan-400 border border-cyan-800/40">
                      {proj.category}
                    </span>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  {proj.instructions && (
                    <div className="p-3 rounded-xl bg-atlas-950 border border-slate-800 text-[11px] text-slate-400">
                      <strong className="text-cyan-400 block mb-0.5 font-mono">Custom Rules:</strong>
                      <p className="line-clamp-2 italic">"{proj.instructions}"</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatDateTime(proj.updatedAt)}
                  </span>

                  <Link
                    href={`/projects/${proj.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-cyan-300 hover:text-white font-semibold transition-all flex items-center gap-1.5"
                  >
                    <span>Open Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-full p-12 text-center text-xs text-slate-500 space-y-2">
                <FolderGit2 className="w-12 h-12 text-slate-700 mx-auto" />
                <p>No project workspaces created yet. Create one to isolate your work!</p>
              </div>
            )}
          </div>

          {/* Create Project Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div
                className="w-full max-w-xl rounded-2xl border border-slate-700 bg-atlas-900 shadow-2xl p-6 overflow-hidden space-y-4"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Create Isolated Project Workspace</span>
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Distributed Consensus Research"
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                        <option value="Coding Projects">Coding Projects</option>
                        <option value="College Projects">College Projects</option>
                        <option value="Research Projects">Research Projects</option>
                        <option value="Study Projects">Study Projects</option>
                        <option value="Content Creation">Content Creation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. Designing BFT consensus algorithms with benchmark evaluation"
                      className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Custom AI System Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      placeholder="e.g. Focus on Rust and TypeScript implementations. Adhere to strict latency constraints..."
                      className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Initial Notes / Checklist
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. - Benchmark Raft vs Paxos&#10;- Implement cryptographic verification"
                      className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
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
                      {creating ? 'Creating...' : 'Initialize Project'}
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
