'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  MessageSquarePlus,
  History,
  Pin,
  Bookmark,
  Wrench,
  Bot,
  FolderGit2,
  Files,
  Settings,
  HelpCircle,
  Shield,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Share2,
  MessageCircle,
  X,
  LogOut,
  User,
} from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useViewMode } from '@/context/ViewModeContext'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface ChatSnippet {
  id: string
  title: string
  pinned: boolean
  saved: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen: propIsOpen, onToggle: propOnToggle }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { viewMode, isMobileDevice, sidebarOpen, setSidebarOpen } = useViewMode()
  const isEffectiveMobile = viewMode === 'mobile' || isMobileDevice

  // Synchronize with ViewMode context
  const isOpen = sidebarOpen !== undefined ? sidebarOpen : propIsOpen
  const onToggle = () => {
    if (setSidebarOpen) {
      setSidebarOpen(prev => !prev)
    }
    propOnToggle?.()
  }

  // Auto-close mobile drawer when navigating between pages on mobile
  useEffect(() => {
    if (isEffectiveMobile && setSidebarOpen) {
      setSidebarOpen(false)
    }
  }, [pathname, isEffectiveMobile, setSidebarOpen])

  const [pinnedChats, setPinnedChats] = useState<ChatSnippet[]>([])
  const [savedChats, setSavedChats] = useState<ChatSnippet[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => setIsAuthenticated(!!data.authenticated))
      .catch(() => setIsAuthenticated(false))

    fetch('/api/chats')
      .then(res => res.json())
      .then(data => {
        if (data.chats) {
          setPinnedChats(data.chats.filter((c: any) => c.pinned).slice(0, 4))
          setSavedChats(data.chats.filter((c: any) => c.saved).slice(0, 4))
        }
      })
      .catch(() => {})
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    setIsAuthenticated(false)
    window.location.href = '/dashboard'
  }

  const getEffectiveHref = (href: string) => {
    if (isAuthenticated !== true && href !== '/dashboard' && href !== '/help') {
      return `/auth/login?redirect=${encodeURIComponent(href)}`
    }
    return href
  }

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'New Chat', href: '/chat', icon: MessageSquarePlus, highlight: true },
    { label: 'Chat History', href: '/history', icon: History },
    { label: 'AI Tools', href: '/tools', icon: Wrench },
    { label: 'AI Agents', href: '/agents', icon: Bot },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Files', href: '/files', icon: Files },
    { label: 'Community & Socials', href: '/community', icon: Share2 },
  ]

  const bottomItems = [
    { label: 'Admin Dashboard', href: '/admin', icon: Shield },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Help & Support', href: '/help', icon: HelpCircle },
  ]

  return (
    <>
      {/* Mobile / Simulated Drawer Backdrop */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity ${
            isEffectiveMobile ? 'block' : 'lg:hidden'
          }`}
          onClick={onToggle}
          title="Click to close menu"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-800/80 bg-atlas-950 transition-all duration-300 shadow-2xl ${
          isEffectiveMobile
            ? isOpen
              ? 'w-72 max-w-[85vw] translate-x-0'
              : '-translate-x-full'
            : isOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Top: Logo & Close / Collapse Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          {isOpen ? (
            <BrandLogo size="sm" showTagline={false} linkTo="/dashboard" />
          ) : (
            <div className="mx-auto">
              <BrandLogo size="sm" showTagline={false} linkTo="/dashboard" />
            </div>
          )}

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-atlas-800/60 transition-colors"
            title={isOpen ? 'Close / Collapse Menu' : 'Expand Menu'}
          >
            {isEffectiveMobile ? (
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            ) : isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Workspace Navigation */}
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={getEffectiveHref(item.href)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40 shadow-neon-sm'
                      : item.highlight
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-white hover:bg-blue-600/40 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-atlas-900 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {isOpen && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>

          {/* Pinned & Saved Chats (Visible when expanded) */}
          {isOpen && (
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              {/* Pinned Chats */}
              {pinnedChats.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Pin className="w-3 h-3 text-cyan-400" />
                    <span>Pinned Chats</span>
                  </div>
                  <div className="space-y-0.5">
                    {pinnedChats.map(c => (
                      <Link
                        key={c.id}
                        href={`/chat/${c.id}`}
                        className="block px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-atlas-900 truncate"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Chats */}
              {savedChats.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Bookmark className="w-3 h-3 text-blue-400" />
                    <span>Saved Chats</span>
                  </div>
                  <div className="space-y-0.5">
                    {savedChats.map(c => (
                      <Link
                        key={c.id}
                        href={`/chat/${c.id}`}
                        className="block px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-atlas-900 truncate"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 shrink-0">
          {bottomItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={getEffectiveHref(item.href)}
                onClick={() => {
                  if (isEffectiveMobile && isOpen) onToggle()
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-atlas-900'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                {isOpen && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}

          {isAuthenticated === true ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors text-left"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
              {isOpen && <span>Sign Out</span>}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/40 border border-cyan-500/40 transition-all"
              title="Sign In / Log In"
            >
              <User className="w-4 h-4 shrink-0 text-cyan-400" />
              {isOpen && <span>Sign In / Log In</span>}
            </Link>
          )}

          {/* Social Channels: Only in the Three-Line Menu Drawer */}
          {isOpen ? (
            <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 block font-bold">
                Official Channels
              </span>

              {/* WhatsApp Group */}
              <a
                href="https://chat.whatsapp.com/KGhDiWhqU7lEmBBFygs5QX?s=cl&p=a&iam=2"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/50 text-[11px] text-emerald-300 hover:text-white transition-colors group"
                title="Join Official WhatsApp Group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">WhatsApp Group</span>
                </div>
                <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Telegram Group */}
              <a
                href="https://t.me/atlasreed04"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/50 text-[11px] text-cyan-300 hover:text-white transition-colors group"
                title="Join Telegram Group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Telegram Group</span>
                </div>
                <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* YouTube Channel */}
              <a
                href="https://youtube.com/@atlasreed911?si=PpzNmeCwv3Qo2WIQ"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-[11px] text-red-300 hover:text-white transition-colors group"
                title="YouTube Channel"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">YouTube Channel</span>
                </div>
                <ExternalLink className="w-3 h-3 text-red-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* GitHub Profile */}
              <a
                href="https://github.com/atlasreed911"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white transition-colors group"
                title="GitHub @atlasreed911"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">GitHub Profile</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1KAsUKGabD/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/50 text-[11px] text-blue-300 hover:text-white transition-colors group"
                title="Facebook Community / Share"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Facebook</span>
                </div>
                <ExternalLink className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Link to Dedicated Hub */}
              <Link
                href="/community"
                onClick={() => {
                  if (isEffectiveMobile && isOpen) onToggle()
                }}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-[11px] font-semibold text-cyan-300 hover:text-white transition-all mt-2"
              >
                <span>View Full Social Hub →</span>
              </Link>
            </div>
          ) : (
            !isEffectiveMobile && (
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-col items-center">
                <Link
                  href="/community"
                  className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-950/40 transition-colors"
                  title="Official Socials & Community Hub"
                >
                  <Share2 className="w-4 h-4" />
                </Link>
              </div>
            )
          )}
        </div>
      </aside>
    </>
  )
}
