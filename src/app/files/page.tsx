'use client'

import React, { useState, useEffect } from 'react'
import {
  Files,
  Upload,
  Search,
  Trash2,
  Edit3,
  Download,
  Eye,
  FileText,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Check,
  X,
  Filter,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { formatBytes, formatDateTime } from '@/lib/utils'

interface FileRecord {
  id: string
  name: string
  size: number
  type: string
  url: string
  projectId?: string
  createdAt: string
}

export default function FileManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [files, setFiles] = useState<FileRecord[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null)

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files')
      const data = await res.json()
      if (data.files) setFiles(data.files)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds maximum 25MB limit.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.file) {
        setFiles(prev => [data.file, ...prev])
      }
    } catch {
      alert('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    await fetch(`/api/files/${id}`, { method: 'DELETE' })
    fetchFiles()
  }

  const handleRename = async (id: string) => {
    if (!editName.trim()) return
    await fetch(`/api/files/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    setEditingId(null)
    fetchFiles()
  }

  const getFileIcon = (type: string, name: string) => {
    if (type.includes('image') || /\.(jpg|jpeg|png|webp|svg)$/i.test(name)) return <ImageIcon className="w-5 h-5 text-purple-400" />
    if (type.includes('pdf') || /\.pdf$/i.test(name)) return <FileText className="w-5 h-5 text-rose-400" />
    if (type.includes('csv') || /\.csv$/i.test(name)) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
    if (type.includes('json') || type.includes('javascript') || /\.(ts|js|py|cpp|c|rs|go)$/i.test(name)) return <FileCode className="w-5 h-5 text-cyan-400" />
    return <FileText className="w-5 h-5 text-blue-400" />
  }

  const filtered = files
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'size') return b.size - a.size
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

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
                <Files className="w-6 h-6 text-cyan-400" />
                <span>Secure File & Document Storage</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Upload and manage PDFs, datasets, code files, and images with database tenant isolation
              </p>
            </div>

            <label className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Encrypting & Storing...' : 'Upload New File'}</span>
              <input type="file" onChange={handleUpload} className="hidden" />
            </label>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search file by name or extension..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-atlas-900 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="date">Upload Date (Recent)</option>
                <option value="name">File Name (A-Z)</option>
                <option value="size">File Size (Largest)</option>
              </select>
            </div>
          </div>

          {/* Files Table / List */}
          <div className="rounded-2xl border border-slate-800 bg-atlas-900/60 overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/80">
              {filtered.map(f => (
                <div
                  key={f.id}
                  className="p-4 hover:bg-atlas-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-atlas-950 border border-slate-800 shrink-0">
                      {getFileIcon(f.type, f.name)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      {editingId === f.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="px-2 py-1 rounded bg-atlas-950 border border-cyan-500 text-xs text-white focus:outline-none font-mono"
                          />
                          <button
                            onClick={() => handleRename(f.id)}
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
                        <h4 className="font-bold text-sm text-white truncate font-mono">
                          {f.name}
                        </h4>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span>Size: {formatBytes(f.size)}</span>
                        <span>•</span>
                        <span>Uploaded: {formatDateTime(f.createdAt)}</span>
                        {f.projectId && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400">Project Linked</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewFile(f)}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-atlas-800 transition-colors"
                      title="Preview details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(f.id)
                        setEditName(f.name)
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-atlas-800 transition-colors"
                      title="Rename"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(f.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="p-10 text-center text-xs text-slate-500 space-y-2">
                  <Files className="w-10 h-10 text-slate-700 mx-auto" />
                  <p>No files uploaded yet. Drag & drop or upload files to your workspace.</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Modal */}
          {previewFile && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
              onClick={() => setPreviewFile(null)}
            >
              <div
                className="w-full max-w-md rounded-2xl border border-slate-700 bg-atlas-900 shadow-2xl p-6 overflow-hidden space-y-4"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white font-mono truncate max-w-xs">
                    {previewFile.name}
                  </h3>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-mono text-white">{formatBytes(previewFile.size)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">MIME Type:</span>
                    <span className="font-mono text-cyan-400">{previewFile.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Uploaded On:</span>
                    <span className="font-mono text-slate-300">{formatDateTime(previewFile.createdAt)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Tenant Isolation:</span>
                    <span className="font-mono text-emerald-400">Enforced by PostgreSQL RLS</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="px-4 py-2 rounded-xl bg-atlas-800 text-xs font-semibold text-white"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
