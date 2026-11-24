'use client'

import React, { useState } from 'react'
import {
  Copy,
  Check,
  Volume2,
  RefreshCw,
  Edit2,
  Bookmark,
  Pin,
  User,
  Paperclip,
  Sparkles,
} from 'lucide-react'
import { CodeBlock } from './CodeBlock'
import { formatDateTime } from '@/lib/utils'

interface Attachment {
  name: string
  url: string
}

interface MessageItemProps {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  attachments?: Attachment[]
  userQuery?: string
  onRegenerate?: () => void
  onEdit?: (newContent: string) => void
}

export const MessageItem: React.FC<MessageItemProps> = ({
  id,
  role,
  content,
  createdAt,
  attachments,
  userQuery,
  onRegenerate,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(content)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const isUser = role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Text-To-Speech with Web Speech API
  const handleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(content.replace(/```[\s\S]*?```/g, 'Code block omitted for speech.'))
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Parse code blocks from markdown
  const renderFormattedContent = (text: string) => {
    const parts = []
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add preceding plain text
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        })
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2],
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      })
    }

    if (parts.length === 0) {
      parts.push({ type: 'text', content: text })
    }

    return parts.map((part, idx) => {
      if (part.type === 'code') {
        return <CodeBlock key={idx} language={part.language} code={part.content} />
      }

      // Simple markdown bold/bullet rendering for plain text
      const lines = part.content.split('\n')
      return (
        <div key={idx} className="space-y-1.5 leading-relaxed">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return <h3 key={lIdx} className="text-sm font-bold text-cyan-300 mt-2">{line.replace('### ', '')}</h3>
            }
            if (line.startsWith('## ')) {
              return <h2 key={lIdx} className="text-base font-bold text-white mt-3">{line.replace('## ', '')}</h2>
            }
            if (line.startsWith('# ')) {
              return <h1 key={lIdx} className="text-lg font-black text-white mt-4">{line.replace('# ', '')}</h1>
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{line.replace(/^[-*]\s+/, '')}</span>
                </div>
              )
            }
            if (/^\d+\.\s/.test(line)) {
              return (
                <div key={lIdx} className="pl-2">
                  <span className="font-semibold text-cyan-400">{line.slice(0, 3)}</span>
                  <span>{line.slice(3)}</span>
                </div>
              )
            }
            if (!line.trim()) {
              return <div key={lIdx} className="h-1" />
            }
            return <p key={lIdx}>{line}</p>
          })}
        </div>
      )
    })
  }

  return (
    <div
      className={`group relative flex gap-3 sm:gap-4 p-4 rounded-2xl transition-all ${
        isUser
          ? 'bg-atlas-900/40 border border-slate-800/60 ml-auto max-w-3xl'
          : 'bg-atlas-900/90 border border-slate-800/80 max-w-4xl shadow-md'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-xs text-blue-200">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50 shadow-neon-sm bg-black">
            <img src="/assets/logo.jpg" alt="ATLAS AI" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Name & Timestamp */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {isUser ? 'You' : 'ATLAS AI'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {formatDateTime(createdAt)}
            </span>
          </div>

          {/* Action Buttons (Copy, TTS, Regenerate, Edit) */}
          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-atlas-800 text-slate-400 hover:text-white transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {!isUser && (
              <>
                <button
                  onClick={handleTTS}
                  className={`p-1 rounded hover:bg-atlas-800 transition-colors ${
                    isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-slate-400 hover:text-white'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1 rounded hover:bg-atlas-800 text-slate-400 hover:text-white transition-colors"
                    title="Regenerate response"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {isUser && onEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 rounded hover:bg-atlas-800 text-slate-400 hover:text-white transition-colors"
                title="Edit message"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-1">
            {attachments.map((att, aIdx) => (
              <div
                key={aIdx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-atlas-950 border border-slate-700 text-xs text-cyan-300"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content or Edit Box */}
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <textarea
              rows={3}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full p-2 rounded-xl bg-atlas-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onEdit) onEdit(editValue)
                  setIsEditing(false)
                }}
                className="px-3 py-1 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Save & Update
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-slate-200">
            {renderFormattedContent(content)}
          </div>
        )}
      </div>
    </div>
  )
}
