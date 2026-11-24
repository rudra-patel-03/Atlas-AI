'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  Paperclip,
  Mic,
  ArrowUp,
  Square,
  Plus,
  Pin,
  Bookmark,
  Share2,
  Trash2,
  Edit3,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Bot,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Globe,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MessageItem } from '@/components/chat/MessageItem'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  attachments?: any[]
}

interface ChatSession {
  id: string
  title: string
  pinned: boolean
  saved: boolean
  model: string
  updatedAt: string
}

export default function ChatPage({ params }: { params?: { id?: string } }) {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats, setChats] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(params?.id || null)
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash')
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isListening, setIsListening] = useState(false)
  const [editChatTitle, setEditChatTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isGenerating])

  // Fetch all user chats
  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats')
      const data = await res.json()
      if (data.chats) {
        setChats(data.chats)
        if (!currentChatId && data.chats.length > 0) {
          loadChat(data.chats[0].id)
        }
      }
    } catch (e) {
      console.error('Failed to load chats', e)
    }
  }

  // Load a specific chat session
  const loadChat = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`)
      if (!res.ok) return
      const data = await res.json()
      setCurrentChatId(chatId)
      setCurrentChat(data.chat)
      setSelectedModel(data.chat.model || 'gemini-2.0-flash')
      setMessages(data.messages || [])
    } catch (e) {
      console.error('Failed to load chat details', e)
    }
  }

  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          window.location.replace('/auth/login?redirect=/chat')
          return
        }
        setAuthChecking(false)
        fetchChats()
      })
      .catch(() => {
        window.location.replace('/auth/login?redirect=/chat')
      })

    // Check if initial prompt was passed from Dashboard
    const initialPrompt = sessionStorage.getItem('atlas_initial_prompt')
    if (initialPrompt) {
      sessionStorage.removeItem('atlas_initial_prompt')
      setInput(initialPrompt)
    }
  }, [])

  // Create new conversation
  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Conversation',
          model: selectedModel,
        }),
      })
      const data = await res.json()
      if (data.chat) {
        setChats(prev => [data.chat, ...prev])
        setCurrentChatId(data.chat.id)
        setCurrentChat(data.chat)
        setMessages([])
      }
    } catch (e) {
      console.error('Failed to create new chat', e)
    }
  }

  // Send message with streaming response
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input
    if (!textToSend.trim() || isGenerating) return

    setInput('')
    const tempUserMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
      attachments: attachments.map(a => ({ name: a.name, url: '' })),
    }

    setMessages(prev => [...prev, tempUserMsg])
    setAttachments([])
    setIsGenerating(true)

    // Placeholder for incoming streaming assistant message
    const tempAssistantId = 'msg-ast-' + Date.now()
    const tempAssistantMsg: Message = {
      id: tempAssistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempAssistantMsg])

    // Setup abort controller
    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          chatId: currentChatId,
          message: textToSend,
          model: selectedModel,
        }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to generate response')
      }

      // Read returned chat id header if new chat was auto-created
      const headerChatId = res.headers.get('X-Chat-Id')
      if (headerChatId && headerChatId !== currentChatId) {
        setCurrentChatId(headerChatId)
        fetchChats()
      }

      // Stream chunks
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk

          setMessages(prev =>
            prev.map(m =>
              m.id === tempAssistantId ? { ...m, content: accumulated } : m
            )
          )
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === tempAssistantId
              ? { ...m, content: m.content + '\n\n*(Generation stopped by user)*' }
              : m
          )
        )
      } else {
        setMessages(prev =>
          prev.map(m =>
            m.id === tempAssistantId
              ? { ...m, content: `*(Error: ${err.message || 'Connection failed'})*` }
              : m
          )
        )
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
      fetchChats()
    }
  }

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  // Pin chat
  const handleTogglePin = async () => {
    if (!currentChatId || !currentChat) return
    const newPinned = !currentChat.pinned
    await fetch(`/api/chats/${currentChatId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: newPinned }),
    })
    setCurrentChat(prev => (prev ? { ...prev, pinned: newPinned } : null))
    fetchChats()
  }

  // Save chat
  const handleToggleSave = async () => {
    if (!currentChatId || !currentChat) return
    const newSaved = !currentChat.saved
    await fetch(`/api/chats/${currentChatId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saved: newSaved }),
    })
    setCurrentChat(prev => (prev ? { ...prev, saved: newSaved } : null))
    fetchChats()
  }

  // Delete chat
  const handleDeleteChat = async () => {
    if (!currentChatId) return
    if (!confirm('Are you sure you want to delete this conversation?')) return
    await fetch(`/api/chats/${currentChatId}`, { method: 'DELETE' })
    setCurrentChatId(null)
    setCurrentChat(null)
    setMessages([])
    fetchChats()
  }

  // Rename chat
  const handleRenameChat = async () => {
    if (!currentChatId || !newTitle.trim()) return
    await fetch(`/api/chats/${currentChatId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    setCurrentChat(prev => (prev ? { ...prev, title: newTitle } : null))
    setEditChatTitle(false)
    fetchChats()
  }

  // Export chat as Markdown
  const handleExportChat = () => {
    if (messages.length === 0) return
    let md = `# Conversation: ${currentChat?.title || 'ATLAS AI Chat'}\n`
    md += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`
    messages.forEach(m => {
      md += `### ${m.role === 'user' ? 'User' : 'ATLAS AI'}\n`
      md += `${m.content}\n\n`
    })

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(currentChat?.title || 'atlas_chat').replace(/\s+/g, '_')}.md`
    link.click()
  }

  // Speech Recognition Microphone
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.')
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
        setInput(prev => (prev ? prev + ' ' + transcript : transcript))
      }

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const filteredChats = chats.filter(c =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  )

  if (authChecking) {
    return (
      <div className="min-h-screen bg-atlas-950 flex flex-col items-center justify-center text-slate-100">
        <div className="p-6 rounded-2xl bg-atlas-900 border border-slate-800 text-center space-y-3 max-w-sm shadow-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Verifying compulsory authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentModel={selectedModel}
        onSelectModel={m => setSelectedModel(m)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div
          className={`flex-1 flex transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          } h-[calc(100vh-4rem)] overflow-hidden`}
        >
          {/* Internal Chat History Drawer (Desktop left) */}
          <div className="hidden md:flex flex-col w-72 border-r border-slate-800/80 bg-atlas-950/95 p-3 space-y-3">
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-neon-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>

            {/* Chat search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-atlas-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredChats.map(c => {
                const isSelected = c.id === currentChatId
                return (
                  <button
                    key={c.id}
                    onClick={() => loadChat(c.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-atlas-900 border border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {c.pinned && <Pin className="w-3 h-3 text-cyan-400" />}
                      {c.saved && <Bookmark className="w-3 h-3 text-blue-400" />}
                    </div>
                  </button>
                )
              })}

              {filteredChats.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No conversations found
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Conversation View */}
          <div className="flex-1 flex flex-col h-full bg-atlas-950 overflow-hidden relative">
            {/* Chat Header Controls */}
            <div className="h-14 px-4 sm:px-6 border-b border-slate-800/80 bg-atlas-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 max-w-md">
                {editChatTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRenameChat()}
                      className="px-2 py-1 rounded bg-atlas-950 border border-cyan-500 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={handleRenameChat}
                      className="px-2 py-1 rounded bg-blue-600 text-[11px] font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditChatTitle(false)}
                      className="text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {currentChat?.title || 'New Conversation'}
                    </span>
                    <button
                      onClick={() => {
                        setNewTitle(currentChat?.title || '')
                        setEditChatTitle(true)
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Rename conversation"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handleTogglePin}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentChat?.pinned ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-400 hover:text-white hover:bg-atlas-800'
                  }`}
                  title={currentChat?.pinned ? 'Unpin' : 'Pin conversation'}
                >
                  <Pin className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentChat?.saved ? 'text-blue-400 bg-blue-950/60' : 'text-slate-400 hover:text-white hover:bg-atlas-800'
                  }`}
                  title={currentChat?.saved ? 'Unsave' : 'Save conversation'}
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <button
                  onClick={handleExportChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-atlas-800 transition-colors"
                  title="Export conversation as Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDeleteChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 shadow-neon-blue bg-black">
                      <img src="/assets/logo.jpg" alt="ATLAS AI" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white">How can ATLAS AI assist you?</h2>
                    <p className="text-xs text-slate-400 max-w-md">
                      Ask technical queries, generate full-stack algorithms, synthesize research papers, or convert documents.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full pt-4">
                    {[
                      'Implement an LRU Cache with O(1) ops in TypeScript',
                      'Explain Zero-Knowledge Rollups and cryptographic proofs',
                      'Analyze security vectors in modern JWT authentication',
                      'Generate a study roadmap for distributed consensus',
                    ].map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => handleSendMessage(prompt)}
                        className="p-3 rounded-xl bg-atlas-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-atlas-800 text-xs text-slate-300 text-left transition-all"
                      >
                        ⚡ {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const precedingUserMsg = m.role === 'assistant'
                    ? [...messages.slice(0, idx)].reverse().find(msg => msg.role === 'user')?.content
                    : undefined

                  return (
                    <MessageItem
                      key={m.id}
                      id={m.id}
                      role={m.role}
                      content={m.content}
                      createdAt={m.createdAt}
                      attachments={m.attachments}
                      userQuery={precedingUserMsg}
                      onRegenerate={() => {
                        if (m.role === 'assistant') {
                          if (precedingUserMsg) handleSendMessage(precedingUserMsg)
                        }
                      }}
                      onEdit={newText => handleSendMessage(newText)}
                    />
                  )
                })
              )}

              {/* Generating Typing indicator */}
              {isGenerating && (
                <div className="flex items-center gap-2 p-3 text-xs text-cyan-400 font-mono">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>ATLAS AI is reasoning & streaming response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Stop Generating Button */}
            {isGenerating && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
                <button
                  onClick={handleStopGeneration}
                  className="px-4 py-2 rounded-xl bg-atlas-900/90 border border-rose-500 text-rose-300 text-xs font-semibold hover:bg-rose-950 flex items-center gap-2 shadow-lg backdrop-blur-md transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Generating</span>
                </button>
              </div>
            )}

            {/* Bottom Input Area */}
            <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-atlas-950 shrink-0">
              <div className="max-w-4xl mx-auto space-y-2">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-1">
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950 border border-blue-800 text-xs text-cyan-300"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{file.name}</span>
                        <button
                          onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                          className="ml-1 text-slate-400 hover:text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative rounded-2xl bg-atlas-900 border border-slate-800 focus-within:border-cyan-500/80 transition-all p-3 shadow-inner">
                  <textarea
                    rows={2}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder={`Message ATLAS AI (${selectedModel})...`}
                    className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none placeholder:text-slate-500 resize-none"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <label
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-atlas-800 cursor-pointer transition-colors"
                        title="Attach files or code"
                      >
                        <Paperclip className="w-4 h-4" />
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={e => {
                            if (e.target.files) {
                              setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        className={`p-1.5 rounded-lg transition-colors ${
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
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || isGenerating}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm transition-all flex items-center gap-1.5"
                    >
                      <span>Send</span>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
