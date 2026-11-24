'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserCheck,
  Sparkles,
  Code2,
  Search,
  ArrowLeft,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'
import { GoogleOAuthModal } from '@/components/auth/GoogleOAuthModal'

export default function LoginPage() {
  const router = useRouter()
  const [redirectTarget, setRedirectTarget] = useState('/dashboard')
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const red = params.get('redirect')
      if (red && red.startsWith('/')) {
        setRedirectTarget(red)
      }
    }
  }, [])

  // Interactive preview tab on the showcase column
  const [previewTab, setPreviewTab] = useState<'chat' | 'code' | 'agents'>('chat')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const cleanUser = usernameOrEmail.trim()
    const cleanPass = password.trim()

    if (!cleanUser || !cleanPass) {
      setError('Please enter your username or email, and password.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: cleanUser,
          password: cleanPass,
        }),
      })

      let data: any = {}
      try {
        data = await res.json()
      } catch (parseErr) {
        throw new Error('Server connection was interrupted. Please try logging in again.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials. Please verify username and password.')
      }

      setSuccess('Access verified! Entering ATLAS workspace...')
      setTimeout(() => {
        window.location.replace(redirectTarget)
      }, 150)
    } catch (err: any) {
      setError(err.message || 'Invalid username, email, or password.')
    } finally {
      setLoading(false)
    }
  }

  // Google Sign-In Account Selection & OAuth Handshake
  const handleGoogleAccountSelected = async (account: { name: string; email: string; avatar?: string }) => {
    setGoogleLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google-auth',
          googleName: account.name,
          googleEmail: account.email,
          googleAvatar: account.avatar,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Google authentication failed.')
      }

      setSuccess('Google account verified! Redirecting...')
      setTimeout(() => {
        window.location.replace(redirectTarget)
      }, 150)
    } catch (err: any) {
      setError(err.message || 'Google authentication error.')
      throw err
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-atlas-950/70 backdrop-blur-xl px-3 sm:px-8 flex items-center justify-between relative z-20">
        <div className="flex items-center">
          <BrandLogo size="sm" showTagline={false} linkTo="/auth/login" className="sm:hidden" />
          <BrandLogo size="md" showTagline={true} linkTo="/auth/login" className="hidden sm:flex" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
          <ThemeToggle showLabel={false} />
          <ViewModeToggle showLabel={true} />

          <Link
            href={`/auth/signup${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="px-2.5 sm:px-4 py-1.5 rounded-xl border border-blue-500/50 bg-blue-600/20 hover:bg-blue-600 text-cyan-300 hover:text-white transition-all shadow-sm text-[11px] sm:text-xs shrink-0 whitespace-nowrap"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Main Dual-Column Split Screen Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative z-10">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT COLUMN: The Interactive Login Form (5 cols on lg) */}
          <div className="lg:col-span-5 w-full max-w-lg mx-auto space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-cyan-800/50 text-[11px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Workspace Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Log In to ATLAS AI
              </h1>
              <p className="text-xs text-slate-400">
                Enter your username or email and password to resume your workflow
              </p>
            </div>

            {/* Login Card */}
            <div className="p-5 sm:p-7 rounded-3xl bg-atlas-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
              {/* Compulsory Authentication Notice if redirected from protected feature */}
              {redirectTarget !== '/dashboard' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/90 to-cyan-950/70 border border-cyan-500/50 flex items-start gap-3 text-cyan-200 text-xs shadow-neon-sm">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-xs">Sign In Required</span>
                    <span className="text-[11px] text-slate-300">
                      Authentication is compulsory to access AI Chat, Tools, and Workspaces. Sign in or register below to continue.
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Switcher Tabs: Log In vs Sign In */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-atlas-950 border border-slate-800/80 text-xs font-semibold text-center mb-1">
                <span className="py-2 rounded-xl bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-default">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </span>
                <Link
                  href={`/auth/signup${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                  className="py-2 rounded-xl text-slate-400 hover:text-white hover:bg-atlas-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In / Register</span>
                </Link>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 flex items-start gap-2.5 text-emerald-300 text-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* 1. SIGN IN WITH GOOGLE */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  disabled={googleLoading || loading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-atlas-950 hover:bg-atlas-800 text-slate-100 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-sm hover:border-slate-500 disabled:opacity-50 group"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute px-3 bg-atlas-900 text-[10px] font-mono tracking-wider uppercase text-slate-500">
                  Or Log In With Username
                </span>
              </div>

              {/* 2. LOGIN FORM: Username, Password, Forgot Password */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Username or Email field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={e => setUsernameOrEmail(e.target.value)}
                      placeholder="Username (e.g. atlasreed) or email"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 text-xs text-white focus:outline-none placeholder:text-slate-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Password field with Forgot Password Option */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    {/* Forget Password Option */}
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Forgot password?</span>
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 text-xs text-white focus:outline-none placeholder:text-slate-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me option */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-atlas-950 text-blue-600 focus:ring-0"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm hover:shadow-neon-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2 pt-2.5 pb-2.5"
                >
                  {loading ? (
                    <span>Authenticating Credentials...</span>
                  ) : (
                    <>
                      <span>Log In to Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Direct Switch to Sign In / Register */}
            <div className="text-center text-xs text-slate-400">
              Don't have an ATLAS account?{' '}
              <Link
                href={`/auth/signup${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign In & Register →
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Home Page / Dashboard Style Interactive Showcase (7 cols on lg) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6 pl-4">
            {/* Header Badge & Hero Title */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-700/50 text-xs font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>ATLAS WORKSPACE ACTIVE</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Multi-Model Engine</span>
              </div>

              <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
                Chat. Create. Code. Learn.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 block">
                  The Complete AI Workspace.
                </span>
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Log in to resume your private conversations, project sandboxes, structured research whitepapers, and full-stack code generators.
              </p>
            </div>

            {/* Simulated Live Workspace Dashboard Window */}
            <div className="rounded-2xl border border-slate-800 bg-atlas-900/90 shadow-2xl p-4 space-y-3 backdrop-blur-xl relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-cyan-500/20 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 pointer-events-none" />

              {/* Mock Window Top Bar */}
              <div className="relative flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-slate-500 font-mono ml-1.5">atlas-ai://dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-800/40">
                    Engine: Gemini 2.0 Flash
                  </span>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="relative flex gap-2 pt-1 border-b border-slate-800 pb-2">
                {[
                  { id: 'chat', label: 'AI Chat Session', icon: Sparkles },
                  { id: 'code', label: 'Code Architect', icon: Code2 },
                  { id: 'agents', label: 'Autonomous Agents', icon: Shield },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      previewTab === tab.id
                        ? 'bg-blue-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Display Area */}
              <div className="relative p-3.5 rounded-xl bg-atlas-950/90 border border-slate-800 text-xs min-h-[160px] font-mono">
                {previewTab === 'chat' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-400 font-sans">
                      <span className="text-cyan-400 font-bold">You:</span>
                      <span>Synthesize a high-concurrency event subscriber in TypeScript.</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-950/40 border border-cyan-800/40 text-slate-200 font-sans space-y-1">
                      <p className="text-cyan-300 font-bold font-mono">⚡ ATLAS Code Architect:</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                        Generated event bus with type-safe subscriptions, retry backoff, and zero-allocation queue.
                      </p>
                    </div>
                  </div>
                )}

                {previewTab === 'code' && (
                  <div className="space-y-1 text-slate-300">
                    <div className="text-cyan-400">// ATLAS Algorithmic Optimization</div>
                    <div className="text-purple-400">interface CacheEntry&lt;V&gt; &#123; value: V; expires: number; &#125;</div>
                    <div className="text-emerald-300">class LRUCache&lt;K, V&gt; &#123;</div>
                    <div className="pl-4 text-slate-400">// O(1) read/write with doubly-linked list</div>
                    <div className="pl-4 text-cyan-300">get(key: K): V | undefined &#123; ... &#125;</div>
                    <div>&#125;</div>
                  </div>
                )}

                {previewTab === 'agents' && (
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono text-[11px]">
                      <Shield className="w-3.5 h-3.5" />
                      <span>7 PRE-CONFIGURED AUTONOMOUS PERSONAS</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Deploy Atlas Code Architect, Socratic Study Tutor, Deep Research Analyst, and Cyber Sentinel Mentor to handle complex domain problems.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Telemetry Chips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-0.5">
                <span className="text-lg font-black text-white font-mono">99.98%</span>
                <span className="text-[10px] text-slate-400 block">System Uptime</span>
              </div>
              <div className="p-3 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-0.5">
                <span className="text-lg font-black text-cyan-400 font-mono">13 Tools</span>
                <span className="text-[10px] text-slate-400 block">Fully Integrated</span>
              </div>
              <div className="p-3 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-0.5">
                <span className="text-lg font-black text-purple-400 font-mono">20+ Langs</span>
                <span className="text-[10px] text-slate-400 block">Code Synthesis</span>
              </div>
            </div>

            {/* Community & Social Links Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WhatsApp Community Link */}
              <a
                href="https://chat.whatsapp.com/KGhDiWhqU7lEmBBFygs5QX?s=cl&p=a&iam=2"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-atlas-900 border border-emerald-700/50 hover:border-emerald-500 flex items-center justify-between text-xs transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold group-hover:text-white transition-colors">
                    WhatsApp Group
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Join Group →</span>
              </a>

              {/* Telegram Channel Link */}
              <a
                href="https://t.me/atlasreed04"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-atlas-900 to-blue-950/30 border border-cyan-800/50 hover:border-cyan-500 flex items-center justify-between text-xs transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold group-hover:text-white transition-colors">
                    Telegram Group
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 font-semibold">@atlasreed04 →</span>
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Google Account Selector Dialog */}
      <GoogleOAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleAccountSelected}
      />
    </div>
  )
}
