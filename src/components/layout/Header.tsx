'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  User as UserIcon,
  LogOut,
  Settings,
  Shield,
  HelpCircle,
  X,
} from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { ModelSelector } from '@/components/ui/ModelSelector'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'
import { useViewMode } from '@/context/ViewModeContext'

interface HeaderProps {
  onToggleSidebar?: () => void
  currentModel?: string
  onSelectModel?: (model: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar: propOnToggle,
  currentModel = 'gemini-2.0-flash',
  onSelectModel = () => {},
}) => {
  const router = useRouter()
  const { viewMode, isMobileDevice, sidebarOpen, setSidebarOpen } = useViewMode()
  const isEffectiveMobile = viewMode === 'mobile' || isMobileDevice

  const handleToggleMenu = () => {
    if (setSidebarOpen) {
      setSidebarOpen(prev => !prev)
    }
    propOnToggle?.()
  }
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<{ name: string; email: string; role: string; avatar?: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/auth/login')
  }

  // Quick navigation items for search
  const searchablePages = [
    { name: 'AI Chat', path: '/chat', desc: 'Real-time conversational intelligence' },
    { name: 'Code Generator', path: '/tools/code', desc: 'Synthesize & optimize code' },
    { name: 'Image Generator', path: '/tools/image', desc: 'Text to image generation studio' },
    { name: 'Deep Research', path: '/tools/research', desc: 'Multi-source empirical research' },
    { name: 'Document Assistant', path: '/tools/doc-assistant', desc: 'Parse & query PDF/DOCX' },
    { name: 'Summarizer', path: '/tools/summarizer', desc: 'High density text digest' },
    { name: 'Notes Generator', path: '/tools/notes', desc: 'Study notes & flashcards' },
    { name: 'Translator', path: '/tools/translator', desc: 'Multi-language neural translation' },
    { name: 'Prompt Generator', path: '/tools/prompt', desc: 'Engineered prompts for all domains' },
    { name: 'PDF Maker', path: '/tools/pdf', desc: 'Export formatted documents to PDF' },
    { name: 'Voice Maker', path: '/tools/voice', desc: 'Text-to-speech audio synthesis' },
    { name: 'Voice Chat', path: '/tools/voice-chat', desc: 'Hands-free spoken voice assistant' },
    { name: 'Video Generator', path: '/tools/video', desc: 'Text-to-video generation' },
    { name: 'AI Agents', path: '/agents', desc: 'Specialized autonomous assistants' },
    { name: 'Projects', path: '/projects', desc: 'Workspaces for coding, study & content' },
    { name: 'Files', path: '/files', desc: 'Secure document & media library' },
    { name: 'Settings', path: '/settings', desc: 'Preferences, models, and API keys' },
    { name: 'Admin Dashboard', path: '/admin', desc: 'Platform telemetry and user admin' },
  ]

  const filteredSearch = searchQuery.trim()
    ? searchablePages.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchablePages.slice(0, 8)

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-atlas-950/80 backdrop-blur-xl px-2.5 sm:px-4 flex items-center justify-between gap-2 max-w-full">
        {/* Left: Three-Line Menu Toggle & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleToggleMenu}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-atlas-900/70 hover:bg-atlas-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center shrink-0 group active:scale-95 shadow-sm"
            title="Toggle Menu (Three Lines)"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
          </button>

          <BrandLogo size="sm" showTagline={false} linkTo="/dashboard" />
        </div>

        {/* Center: Search Trigger (Cmd+K style) - Expands on larger desktop screens */}
        <div className="hidden xl:flex flex-1 max-w-xs 2xl:max-w-md mx-2 2xl:mx-6 min-w-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-atlas-900/60 hover:bg-atlas-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-inner truncate"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">Search tools, chats, agents...</span>
            </div>
            <kbd className="hidden 2xl:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-atlas-800 border border-slate-700 rounded text-slate-400 shrink-0 ml-2">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Model Selector, Theme Switcher, Notifications, Profile */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-2.5 shrink-0 ml-auto">
          <ModelSelector currentModel={currentModel} onSelectModel={onSelectModel} compact={isEffectiveMobile} />

          {/* Theme Switcher: Dark / Light / Device Mode */}
          <ThemeToggle showLabel={false} />

          {/* View Mode Switcher: Web View <-> Mobile View */}
          <ViewModeToggle showLabel={!isEffectiveMobile} />

          {/* Search button on smaller screens (< xl) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-atlas-800/60 transition-colors xl:hidden shrink-0"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-atlas-800/60 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-800 bg-atlas-900/95 shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-semibold text-white">Notifications</span>
                    <span className="text-[10px] text-cyan-400">Mark all read</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-900/50">
                      <p className="font-semibold text-blue-300">Welcome to ATLAS AI ⚡</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Explore 13 integrated tools and custom AI agents.</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">Just now</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <p className="font-semibold text-slate-200">Gemini 2.0 Flash Ready</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">High-speed multimodal inference active.</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Dropdown or Sign In CTA */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-800 hover:border-blue-500/50 bg-atlas-900/70 transition-all"
              >
                <img
                  src={user.avatar || '/assets/logo.jpg'}
                  alt={user.name || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-cyan-400/40"
                />
                <span className="hidden sm:inline-block text-xs font-medium text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-atlas-900/95 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] bg-blue-950 text-cyan-300 border border-cyan-800/40 uppercase font-mono">
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-xs text-slate-300">
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-atlas-800 hover:text-white transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Account Settings</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-atlas-800 hover:text-white transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        href="/help"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-atlas-800 hover:text-white transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Help & Support</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-cyan-500/60 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 hover:from-blue-600 hover:to-cyan-500 text-cyan-300 hover:text-white font-bold text-xs transition-all shadow-neon-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-700 bg-atlas-900 shadow-2xl p-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-cyan-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools, agents, projects, files..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-atlas-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
              {filteredSearch.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-atlas-800 text-slate-300 hover:text-white transition-colors group"
                >
                  <div>
                    <span className="font-semibold text-sm group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </span>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 group-hover:text-cyan-400 font-mono">
                    Jump →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
