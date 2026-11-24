'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  User,
  Shield,
  Palette,
  Cpu,
  Key,
  Bell,
  Save,
  CheckCircle2,
  Lock,
  Globe2,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Check,
  Smartphone,
  Monitor,
  ShieldCheck,
  AlertCircle,
  EyeOff,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ThemeToggle, ThemeMode } from '@/components/ui/ThemeToggle'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'ai' | 'appearance' | 'keys'>('profile')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [defaultModel, setDefaultModel] = useState('gemini-2.0-flash')
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState(true)
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [revokeSuccess, setRevokeSuccess] = useState(false)

  const handleRevokeAllSessions = async () => {
    setRevoking(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke-sessions' }),
      })
      if (res.ok) {
        setRevokeSuccess(true)
        setTimeout(() => setRevokeSuccess(false), 3000)
      }
    } finally {
      setRevoking(false)
    }
  }

  useEffect(() => {
    // Check locally stored theme preference
    const storedTheme = (localStorage.getItem('atlas_theme') as ThemeMode) || 'dark'
    setTheme(storedTheme)

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setName(data.user.name || '')
          setEmail(data.user.email || '')
          setBio(data.user.bio || '')
        }
        if (data.settings) {
          setDefaultModel(data.settings.defaultModel || 'gemini-2.0-flash')
          if (data.settings.theme && !localStorage.getItem('atlas_theme')) {
            setTheme(data.settings.theme)
          }
          setLanguage(data.settings.language || 'en')
          setNotifications(data.settings.notifications ?? true)
        }
      })
      .catch(() => {})
  }, [])

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode)
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    root.setAttribute('data-theme', mode)
    localStorage.setItem('atlas_theme', mode)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          defaultModel,
          theme,
          language,
          notifications,
          geminiApiKey,
          openaiApiKey,
        }),
      })

      localStorage.setItem('atlas_preferred_model', defaultModel)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch {
      alert('Failed to update settings.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'ai', label: 'AI Preferences', icon: Cpu },
    { id: 'keys', label: 'API Keys & Providers', icon: Key },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'appearance', label: 'Appearance & UI', icon: Palette },
  ]

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          } p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8`}
        >
          {/* Header */}
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              <span>Workspace Preferences & Settings</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure personal profile, AI model routing, API credentials, and interface themes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Tabs (4 cols) */}
            <div className="lg:col-span-4 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600/30 text-cyan-300 border border-cyan-500/50 shadow-neon-sm'
                        : 'text-slate-400 hover:text-white hover:bg-atlas-900 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Right Tab Content (8 cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-atlas-900/80 border border-slate-800 shadow-xl space-y-6">
              {savedSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 flex items-center gap-2 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Preferences saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-5">
                {/* 1. Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Personal Account Information
                    </h3>

                    <div className="flex items-center gap-4 py-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-neon-sm bg-black">
                        <img src="/assets/logo.jpg" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{name || 'Atlas Reed'}</h4>
                        <p className="text-xs text-slate-400">{email || 'atlasreed@atlas.ai'}</p>
                        <span className="text-[10px] font-mono text-cyan-400">ATLAS Enterprise User</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full p-2.5 rounded-xl bg-atlas-950/50 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Professional Bio / Specialty
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="e.g. Full-stack software engineer and distributed systems researcher"
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                {/* 2. AI Preferences */}
                {activeTab === 'ai' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      AI Model Routing & Personalization
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Default Reasoning Model
                      </label>
                      <select
                        value={defaultModel}
                        onChange={e => setDefaultModel(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none"
                      >
                        <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Recommended — High Speed)</option>
                        <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Multimodal Reasoning)</option>
                        <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra-fast Q&A)</option>
                        <option value="gpt-4o">OpenAI GPT-4o (If configured)</option>
                      </select>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs space-y-1">
                      <p className="font-semibold text-white">Multi-Model Auto Fallback</p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        If an external API experiences a transient rate-limit or network timeout, the ATLAS AI provider layer automatically routes to the closest secondary tier.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. API Keys */}
                {activeTab === 'keys' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Custom API Key Configuration
                    </h3>
                    <p className="text-xs text-slate-400">
                      Keys entered here are securely used for your sessions. You can also define them server-side in <code className="text-cyan-400">.env.local</code>.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Google Gemini API Key
                      </label>
                      <input
                        type="password"
                        value={geminiApiKey}
                        onChange={e => setGeminiApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        OpenAI API Key (Optional)
                      </label>
                      <input
                        type="password"
                        value={openaiApiKey}
                        onChange={e => setOpenaiApiKey(e.target.value)}
                        placeholder="sk-proj-..."
                        className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Security & Privacy Shield */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    {/* Live Defense Posture Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-atlas-900 via-blue-950/40 to-cyan-950/20 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <span>ATLAS Enterprise Security & Privacy Shield</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-[10px] font-mono text-emerald-400 font-semibold">
                                ARMORED
                              </span>
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Active real-time defense shielding your data against hacking, leaks, and exfiltration.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Security Features Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="p-2.5 rounded-xl bg-atlas-950/80 border border-slate-800/80 flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                          <div>
                            <span className="text-xs font-semibold text-white block">WAF & Intrusion Blocker</span>
                            <span className="text-[10px] text-slate-400">Real-time prevention of SQLi, XSS, and directory traversal.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-atlas-950/80 border border-slate-800/80 flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                          <div>
                            <span className="text-xs font-semibold text-white block">Zero-Trust Data Isolation</span>
                            <span className="text-[10px] text-slate-400">Multi-tenant cryptographic user isolation across all records.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-atlas-950/80 border border-slate-800/80 flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                          <div>
                            <span className="text-xs font-semibold text-white block">Anti-Data-Exfiltration Guard</span>
                            <span className="text-[10px] text-slate-400">Strict CSP rules prevent unauthorized outbound data transfers.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-atlas-950/80 border border-slate-800/80 flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
                          <div>
                            <span className="text-xs font-semibold text-white block">Session Cryptography</span>
                            <span className="text-[10px] text-slate-400">HMAC-SHA256 signed tokens with HttpOnly & SameSite flags.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Session Management & Emergency Lockout */}
                    <div className="p-4 rounded-xl bg-atlas-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            Active Session Management
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Log out from all other browsers and mobile devices if you suspect unauthorized access.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleRevokeAllSessions}
                          disabled={revoking}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-rose-300 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          {revoking ? 'Revoking...' : 'Revoke All Sessions'}
                        </button>
                      </div>

                      {revokeSuccess && (
                        <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>All other active sessions have been invalidated and logged out.</span>
                        </div>
                      )}
                    </div>

                    {/* Password Credentials */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Account Password & Credentials
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Minimum 8 characters with letters and numbers/symbols"
                          className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Appearance & Theme Selection */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                          Interface Theme & Display Mode
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Choose between Dark Mode, Light Mode, or automatic Device synchronization.
                        </p>
                      </div>

                      <ThemeToggle variant="segmented" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* Dark Mode Card */}
                      <button
                        type="button"
                        onClick={() => handleThemeChange('dark')}
                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-atlas-900/90 shadow-neon-blue ring-1 ring-blue-500/50'
                            : 'border-slate-800 bg-atlas-950 hover:border-slate-700 hover:bg-atlas-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-cyan-400">
                            <Moon className="w-5 h-5" />
                          </div>
                          {theme === 'dark' && (
                            <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-sm text-white block">
                          Dark Mode
                        </span>
                        <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                          Signature ATLAS AI dark navy-blue theme with electric blue & cyan accents.
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>Recommended</span>
                        </div>
                      </button>

                      {/* Light Mode Card */}
                      <button
                        type="button"
                        onClick={() => handleThemeChange('light')}
                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          theme === 'light'
                            ? 'border-amber-500 bg-atlas-900/90 shadow-neon-sm ring-1 ring-amber-500/50'
                            : 'border-slate-800 bg-atlas-950 hover:border-slate-700 hover:bg-atlas-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400">
                            <Sun className="w-5 h-5" />
                          </div>
                          {theme === 'light' && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-sm text-white block">
                          Light Mode
                        </span>
                        <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                          High-clarity daytime aesthetic with crisp slate surfaces and maximum contrast.
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Daylight Ready</span>
                        </div>
                      </button>

                      {/* Device / System Mode Card */}
                      <button
                        type="button"
                        onClick={() => handleThemeChange('system')}
                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          theme === 'system'
                            ? 'border-cyan-500 bg-atlas-900/90 shadow-neon-cyan ring-1 ring-cyan-500/50'
                            : 'border-slate-800 bg-atlas-950 hover:border-slate-700 hover:bg-atlas-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                            <Laptop className="w-5 h-5" />
                          </div>
                          {theme === 'system' && (
                            <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-sm text-white block">
                          Device Mode
                        </span>
                        <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                          Automatically synchronizes with your device or operating system preferences.
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-blue-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          <span>System Auto-Detect</span>
                        </div>
                      </button>
                    </div>

                    {/* Viewport & View Mode Setting */}
                    <div className="pt-5 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            Viewport & View Mode Layout
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Switch between full desktop Web View and the interactive simulated Mobile View.
                          </p>
                        </div>

                        <ViewModeToggle variant="segmented" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Updating...' : 'Save Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
