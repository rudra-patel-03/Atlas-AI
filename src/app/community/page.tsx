'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Sparkles,
  ShieldCheck,
  QrCode,
  ArrowRight,
  TrendingUp,
  Share2,
  Heart,
  Bell,
  CheckCircle2,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

interface SocialPlatform {
  id: string
  name: string
  category: 'Community' | 'Updates' | 'Developer'
  handle: string
  url: string
  description: string
  followers: string
  primaryColor: string
  badge?: string
  icon: (props: { className?: string }) => React.ReactElement
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Community Group',
    category: 'Community',
    handle: 'Atlas Reed Official Group',
    url: 'https://chat.whatsapp.com/KGhDiWhqU7lEmBBFygs5QX?s=cl&p=a&iam=2',
    description: 'Join our official WhatsApp group for real-time AI discussions, instant model updates, prompt hacks, and direct developer announcements.',
    followers: '5,400+ Members',
    primaryColor: '#25D366',
    badge: 'Most Active',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.44C8.94 7.44 8.68 7.5 8.46 7.74C8.24 7.98 7.63 8.55 7.63 9.71C7.63 10.87 8.48 11.99 8.6 12.15C8.72 12.31 10.27 14.7 12.64 15.72C13.2 15.96 13.64 16.11 13.98 16.22C14.54 16.4 15.06 16.37 15.46 16.31C15.91 16.25 16.85 15.75 17.05 15.19C17.25 14.63 17.25 14.15 17.19 14.05C17.13 13.95 16.97 13.89 16.71 13.76C16.45 13.63 15.19 13.01 14.95 12.93C14.72 12.84 14.55 12.8 14.38 13.04C14.21 13.28 13.73 13.85 13.58 14.02C13.44 14.19 13.29 14.21 13.03 14.08C12.77 13.95 11.94 13.68 10.96 12.81C10.2 12.13 9.68 11.29 9.53 11.03C9.38 10.77 9.51 10.63 9.64 10.5C9.76 10.38 9.9 10.2 10.03 10.05C10.16 9.9 10.21 9.79 10.3 9.62C10.39 9.45 10.34 9.31 10.27 9.18C10.2 9.05 9.63 7.64 9.39 7.07C9.16 6.51 8.92 6.59 8.74 6.58C8.58 6.57 8.39 6.57 8.2 6.57H9.11V7.44Z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook Community',
    category: 'Community',
    handle: 'facebook.com/share/1KAsUKGabD',
    url: 'https://www.facebook.com/share/1KAsUKGabD/',
    description: 'Connect on Facebook for platform discussions, shared project tutorials, community announcements, and AI creator stories.',
    followers: 'Featured Hub',
    primaryColor: '#1877F2',
    badge: 'Official Share',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'telegram',
    name: 'Telegram Group',
    category: 'Community',
    handle: 't.me/atlasreed04',
    url: 'https://t.me/atlasreed04',
    description: 'Fast-paced developer alerts, model release notifications, API changelogs, and direct group community discussions without algorithmic noise.',
    followers: '12.1K Members',
    primaryColor: '#229ED9',
    badge: 'Direct Group',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube Channel',
    category: 'Updates',
    handle: '@atlasreed911',
    url: 'https://youtube.com/@atlasreed911?si=PpzNmeCwv3Qo2WIQ',
    description: 'Watch deep-dive video tutorials, comprehensive full-stack building guides, prompt engineering masterclasses, and AI tool workflow tutorials.',
    followers: '15.4K Subscribers',
    primaryColor: '#FF0000',
    badge: 'Creator Channel',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub Profile',
    category: 'Developer',
    handle: 'github.com/atlasreed911',
    url: 'https://github.com/atlasreed911',
    description: 'Explore open-source AI utilities, SDK integrations, API repositories, and code repositories by Atlas Reed.',
    followers: 'Open Source',
    primaryColor: '#F0F6FC',
    badge: 'Developer',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram Official',
    category: 'Updates',
    handle: '@atlas.ai.tools',
    url: 'https://instagram.com/atlas.ai.tools',
    description: 'Follow our official Instagram for visual AI art showcases, short demo reels, prompt engineering carousels, and behind-the-scenes engineering drops.',
    followers: '28.5K Followers',
    primaryColor: '#E1306C',
    badge: 'Official Brand',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    category: 'Updates',
    handle: '@atlas_ai_tools',
    url: 'https://x.com/atlas_ai_tools',
    description: 'Breaking AI announcements, technical research threads on neural architecture, benchmark comparisons, and live feature updates.',
    followers: '18.9K Followers',
    primaryColor: '#1DA1F2',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'discord',
    name: 'Discord Community Server',
    category: 'Community',
    handle: 'discord.gg/atlas-ai',
    url: 'https://discord.gg/atlas-ai',
    description: 'Join developers, prompt engineers, and AI researchers in dedicated voice lounges, live code help, custom agent builders, and showcase channels.',
    followers: '9,200+ Members',
    primaryColor: '#5865F2',
    badge: 'Developer Hub',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Official',
    category: 'Developer',
    handle: 'ATLAS AI Workspace',
    url: 'https://linkedin.com/company/atlas-ai-workspace',
    description: 'Enterprise AI solutions, team expansions, research milestones, corporate partnerships, and professional AI industry thought leadership.',
    followers: '6.7K Followers',
    primaryColor: '#0A66C2',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
]

export default function CommunityPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'All' | 'Community' | 'Updates' | 'Developer'>('All')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const filteredPlatforms =
    activeCategory === 'All'
      ? SOCIAL_PLATFORMS
      : SOCIAL_PLATFORMS.filter(p => p.category === activeCategory)

  return (
    <div className="flex h-screen bg-atlas-950 text-slate-100 selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-8 relative">
          
          {/* Ambient Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-600/10 via-cyan-600/10 to-blue-600/10 rounded-full blur-[170px] pointer-events-none" />

          {/* PAGE HERO HEADER */}
          <div className="relative z-10 max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ATLAS SOCIAL NETWORK & COMMUNITY HUB</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Connect with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400">
                ATLAS AI Everywhere
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Join our vibrant global community of creators, engineers, researchers, and students. Get instant updates, join daily prompt discussions, and direct link to all official ATLAS AI platforms.
            </p>
          </div>

          {/* FEATURED: OFFICIAL WHATSAPP COMMUNITY BANNER */}
          <div className="relative z-10 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/80 via-atlas-900 to-teal-950/70 border border-emerald-600/40 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Info Column */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 font-mono">
                    Official Community
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live 5,400+ Members
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                    <MessageCircle className="w-8 h-8 text-emerald-400 shrink-0" />
                    <span>Join the Official WhatsApp Group</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    Get instant announcements directly on your phone. Participate in daily AI prompt showcases, receive early access invitations for new models, and connect directly with the ATLAS AI creator team.
                  </p>
                </div>

                {/* Feature Checkpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant AI Alerts & Drops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>VIP Prompt Masterclasses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Direct Creator Support</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="https://chat.whatsapp.com/KGhDiWhqU7lEmBBFygs5QX?s=cl&p=a&iam=2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-neon-sm hover:shadow-neon-blue flex items-center gap-2 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Open & Join WhatsApp Group</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>

                  <button
                    onClick={() => copyToClipboard('https://chat.whatsapp.com/KGhDiWhqU7lEmBBFygs5QX?s=cl&p=a&iam=2', 'whatsapp-main')}
                    className="px-4 py-3 rounded-xl border border-emerald-700/60 hover:border-emerald-500 bg-atlas-950/80 hover:bg-atlas-900 text-xs font-semibold text-emerald-300 hover:text-white transition-all flex items-center gap-2"
                  >
                    {copiedId === 'whatsapp-main' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Group Invite Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="px-3.5 py-3 rounded-xl border border-slate-700/80 hover:border-slate-500 bg-atlas-950/60 hover:bg-atlas-900 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    title="Scan QR Code on Mobile"
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">Scan QR</span>
                  </button>
                </div>
              </div>

              {/* Right Visual Card */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="p-5 rounded-2xl bg-atlas-950/90 border border-emerald-600/40 shadow-inner max-w-xs w-full text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg">
                    <div className="w-full h-full bg-atlas-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                      <MessageCircle className="w-8 h-8 fill-current" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">ATLAS AI Hub</h4>
                    <p className="text-[11px] text-emerald-400 font-mono">@atlas.ai.tools</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-atlas-900 border border-slate-800 text-[11px] text-slate-300">
                    Scan or click to connect immediately with our community members.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL MEDIA PLATFORMS SECTION */}
          <div className="space-y-4 relative z-10">
            {/* Section Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  <span>All Official Social Media Channels</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Click any platform to open directly in a new window or copy invite links.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-atlas-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                {(['All', 'Community', 'Updates', 'Developer'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlatforms.map(platform => {
                const IconComponent = platform.icon
                const isCopied = copiedId === platform.id

                return (
                  <div
                    key={platform.id}
                    className="p-5 rounded-2xl bg-atlas-900/80 hover:bg-atlas-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group hover:shadow-neon-sm"
                  >
                    {/* Top Row: Icon & Badge */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: `${platform.primaryColor}25`, color: platform.primaryColor }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>

                        {platform.badge ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-blue-950 border border-blue-700/60 text-cyan-300">
                            {platform.badge}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {platform.followers}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          <span>{platform.name}</span>
                        </h3>
                        <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                          {platform.handle}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                          {platform.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-atlas-950 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 group/btn"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </a>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(platform.url, platform.id)}
                        className="p-2 rounded-xl bg-atlas-950 hover:bg-atlas-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Copy direct URL"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* COMMUNITY GUIDELINES & ETHICAL CODE */}
          <div className="relative z-10 p-6 rounded-2xl bg-atlas-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>ATLAS Community Guidelines</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              We uphold an inclusive, collaborative space for AI researchers, builders, and learners. All official ATLAS AI groups (WhatsApp, Discord, Telegram) require mutual respect, ethical research practices, and zero spam. For support inquiries or business partnerships, contact us directly at <a href="mailto:support@atlas.ai" className="text-cyan-300 underline">support@atlas.ai</a>.
            </p>
          </div>

        </main>
      </div>

      {/* QR CODE POPUP MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-atlas-900 border border-slate-800 p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Group QR</span>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Simulated High-Res QR Graphic */}
            <div className="p-4 bg-white rounded-2xl mx-auto w-52 h-52 flex flex-col items-center justify-center shadow-lg relative">
              <div className="w-44 h-44 border-4 border-slate-900 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 bg-slate-950 rounded" />
                  <div className="w-10 h-10 bg-slate-950 rounded" />
                </div>
                <div className="text-center font-black text-slate-950 text-xs font-mono tracking-widest">
                  ATLAS AI
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-10 h-10 bg-slate-950 rounded" />
                  <MessageCircle className="w-8 h-8 text-emerald-600 fill-current" />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Scan with your phone camera or WhatsApp to join the group instantly.
            </p>

            <a
              href="https://chat.whatsapp.com/KGhDiWhqU7lEmBBFygs5QX?s=cl&p=a&iam=2"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors block"
            >
              Open Direct Invite Link
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
