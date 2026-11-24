'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  FolderGit2,
  MessageSquare,
  Files,
  Plus,
  Save,
  Trash2,
  ExternalLink,
  Upload,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { formatBytes, formatDateTime } from '@/lib/utils'

export default function ProjectWorkspaceDetail() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [chats, setChats] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [instructions, setInstructions] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) return
      const data = await res.json()
      setProject(data.project)
      setChats(data.chats || [])
      setFiles(data.files || [])
      setNotes(data.project.notes || '')
      setInstructions(data.project.instructions || '')
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchProjectDetails()
  }, [projectId])

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, instructions }),
      })
      alert('Project instructions and notes updated successfully!')
    } catch {
      alert('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleStartProjectChat = async () => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${project?.name} - Dialogue`,
          projectId: project?.id,
        }),
      })
      const data = await res.json()
      if (data.chat) {
        router.push(`/chat/${data.chat.id}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-atlas-950 text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading project workspace...</p>
        </div>
      </div>
    )
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
            <div className="space-y-1">
              <Link
                href="/projects"
                className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1.5 transition-colors mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Projects</span>
              </Link>
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-black text-white">{project.name}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-cyan-400 border border-cyan-800/40">
                  {project.category}
                </span>
              </div>
              <p className="text-xs text-slate-400">{project.description}</p>
            </div>

            <button
              onClick={handleStartProjectChat}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Launch Project Chat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Instructions & Notes (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Project AI System Instructions</span>
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="System prompts enforced exclusively for chats within this workspace..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>

              {/* Project Scratchpad Notes */}
              <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-4 shadow-xl">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Project Notes & Synthesis Scratchpad
                </span>

                <textarea
                  rows={10}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Write project milestones, links, citations, or formulas..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Right Column: Project Chats & Files (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Project Chats */}
              <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span>Project Chats ({chats.length})</span>
                  </span>
                  <button
                    onClick={handleStartProjectChat}
                    className="p-1 rounded text-cyan-400 hover:text-white"
                    title="New Chat in Project"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {chats.map(c => (
                    <Link
                      key={c.id}
                      href={`/chat/${c.id}`}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-atlas-950 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <span className="truncate pr-2">{c.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </Link>
                  ))}

                  {chats.length === 0 && (
                    <p className="text-xs text-slate-500 py-2">No conversations in this project yet.</p>
                  )}
                </div>
              </div>

              {/* Project Files */}
              <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Files className="w-4 h-4 text-blue-400" />
                    <span>Project Files ({files.length})</span>
                  </span>
                  <Link
                    href={`/files?projectId=${project.id}`}
                    className="p-1 rounded text-blue-400 hover:text-white"
                    title="Upload to Project"
                  >
                    <Upload className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {files.map(f => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-atlas-950 border border-slate-800/80 text-xs text-slate-300"
                    >
                      <span className="truncate pr-2 font-mono text-[11px] text-cyan-300">{f.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {formatBytes(f.size)}
                      </span>
                    </div>
                  ))}

                  {files.length === 0 && (
                    <p className="text-xs text-slate-500 py-2">No files linked to this project.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
