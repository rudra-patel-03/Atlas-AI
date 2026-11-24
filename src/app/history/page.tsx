'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  History,
  Search,
  Pin,
  Bookmark,
  Trash2,
  Edit3,
  ExternalLink,
  MessageSquare,
  Calendar,
  Filter,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { formatDateTime } from '@/lib/utils'

interface ChatItem {
  id: string
  title: string
  pinned: boolean
  saved: boolean
  model: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

export default function HistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pinned' | 'saved'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats')
      const data = await res.json()
      if (data.chats) setChats(data.chats)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  const togglePin = async (id: string, current: boolean) => {
    await fetch(`/api/chats/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !current }),
    })
    fetchChats()
  }

  const toggleSave = async (id: string, current: boolean) => {
    await fetch(`/api/chats/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saved: !current }),
    })
    fetchChats()
  }

  const deleteChat = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chat permanently?')) return
    await fetch(`/api/chats/${id}`, { method: 'DELETE' })
    fetchChats()
  }

  const saveTitle = async (id: string) => {
    if (!editTitle.trim()) return
    await fetch(`/api/chats/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle }),
    })
    setEditingId(null)
    fetchChats()
  }

  const filtered = chats.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    if (filter === 'pinned') return matchesSearch && c.pinned
    if (filter === 'saved') return matchesSearch && c.saved
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          } p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6`}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <History className="w-6 h-6 text-cyan-400" />
                <span>Chat History & Archives</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage, search, pin, and export your previous reasoning dialogues
              </p>
            </div>

            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-xs text-white shadow-neon-sm hover:from-blue-500 hover:to-cyan-400 transition-all inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <span>+ New Conversation</span>
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search across all conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-atlas-900 border border-slate-800 self-start">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({chats.length})
              </button>
              <button
                onClick={() => setFilter('pinned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  filter === 'pinned' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>Pinned ({chats.filter(c => c.pinned).length})</span>
              </button>
              <button
                onClick={() => setFilter('saved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  filter === 'saved' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Saved ({chats.filter(c => c.saved).length})</span>
              </button>
            </div>
          </div>

          {/* Chat List Table */}
          <div className="rounded-2xl border border-slate-800 bg-atlas-900/60 overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/80">
              {filtered.map(c => (
                <div
                  key={c.id}
                  className="p-4 hover:bg-atlas-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    {editingId === c.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="px-2 py-1 rounded bg-atlas-950 border border-cyan-500 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => saveTitle(c.id)}
                          className="px-2 py-1 rounded bg-blue-600 text-xs text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={`/chat/${c.id}`}
                        className="font-bold text-sm text-white hover:text-cyan-300 transition-colors truncate block"
                      >
                        {c.title}
                      </Link>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span>Model: {c.model}</span>
                      <span>•</span>
                      <span>Updated: {formatDateTime(c.updatedAt)}</span>
                      {c.projectId && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400">Project: {c.projectId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePin(c.id, c.pinned)}
                      className={`p-2 rounded-lg transition-colors ${
                        c.pinned ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-atlas-800'
                      }`}
                      title={c.pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleSave(c.id, c.saved)}
                      className={`p-2 rounded-lg transition-colors ${
                        c.saved ? 'bg-blue-950 text-blue-300' : 'text-slate-400 hover:text-white hover:bg-atlas-800'
                      }`}
                      title={c.saved ? 'Unsave' : 'Save'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(c.id)
                        setEditTitle(c.title)
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-atlas-800 transition-colors"
                      title="Rename"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteChat(c.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/chat/${c.id}`}
                      className="p-2 rounded-lg bg-atlas-800 text-cyan-400 hover:text-white hover:bg-blue-600 transition-colors ml-1"
                      title="Open Chat"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No chat records found matching criteria
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
