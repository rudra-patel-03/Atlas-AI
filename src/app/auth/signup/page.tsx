'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Code2,
  Search,
  Cpu,
  Zap,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'
import { GoogleOAuthModal } from '@/components/auth/GoogleOAuthModal'

export default function SignInAndRegisterPage() {
  const router = useRouter()
  const [redirectTarget, setRedirectTarget] = useState('/dashboard')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [emailId, setEmailId] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [rewritePassword, setRewritePassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRewritePassword, setShowRewritePassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const red = params.get('redirect')
      if (red && red.startsWith('/')) {
        setRedirectTarget(red)
      }
    }
  }, [])

  // Interactive showcase tab state for right-hand preview
  const [previewTab, setPreviewTab] = useState<'chat' | 'code' | 'research'>('chat')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !username.trim() || !emailId.trim() || !createPassword) {
      setError('Please fill in all registration fields.')
      return
    }

    if (createPassword !== rewritePassword) {
      setError('Passwords do not match. Please verify your confirmed password.')
      return
    }

    if (createPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service to proceed.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          name: fullName,
          username: username.toLowerCase().trim(),
          email: emailId.toLowerCase().trim(),
          password: createPassword,
          confirmPassword: rewritePassword,
          acceptTerms,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.')
      }

      window.location.href = redirectTarget
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Google Sign-In Account Selection & OAuth Handshake
  const handleGoogleAccountSelected = async (account: { name: string; email: string; avatar?: string }) => {
    setGoogleLoading(true)
    setError('')

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

      window.location.href = redirectTarget
    } catch (err: any) {
      setError(err.message || 'Google authentication error.')
      throw err
    } finally {
      setGoogleLoading(false)
    }
  }

  const passwordsMatch = createPassword && rewritePassword && createPassword === rewritePassword
  const passwordsMismatch = rewritePassword && createPassword !== rewritePassword

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-atlas-950/70 backdrop-blur-xl px-3 sm:px-8 flex items-center justify-between relative z-20">
        <div className="flex items-center">
          <BrandLogo size="sm" showTagline={false} linkTo="/auth/signup" className="sm:hidden" />
          <BrandLogo size="md" showTagline={true} linkTo="/auth/signup" className="hidden sm:flex" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
          <ThemeToggle showLabel={false} />
          <ViewModeToggle showLabel={true} />

          <Link
            href={`/auth/login${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="px-2.5 sm:px-4 py-1.5 rounded-xl border border-slate-700 bg-atlas-900/80 hover:bg-atlas-800 text-slate-200 hover:text-white transition-all shadow-sm text-[11px] sm:text-xs shrink-0 whitespace-nowrap"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main Dual-Column Split Screen Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative z-10">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT COLUMN: The Interactive Sign In & Register Form (5 cols on lg) */}
          <div className="lg:col-span-5 w-full max-w-lg mx-auto space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-cyan-800/50 text-[11px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>ATLAS AI Access Registration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-slate-400">
                Sign in with Google or register with your unique username
              </p>
            </div>

            {/* Registration Card */}
            <div className="p-5 sm:p-7 rounded-3xl bg-atlas-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
              {/* Compulsory Authentication Notice if redirected from protected feature */}
              {redirectTarget !== '/dashboard' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/90 to-cyan-950/70 border border-cyan-500/50 flex items-start gap-3 text-cyan-200 text-xs shadow-neon-sm">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-xs">Sign In Required</span>
                    <span className="text-[11px] text-slate-300">
                      Authentication is compulsory to access AI Chat, Tools, and Workspaces. Register your account below to continue.
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Switcher Tabs: Log In vs Sign In */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-atlas-950 border border-slate-800/80 text-xs font-semibold text-center mb-1">
                <Link
                  href={`/auth/login${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                  className="py-2 rounded-xl text-slate-400 hover:text-white hover:bg-atlas-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>
                <span className="py-2 rounded-xl bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-default">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In / Register</span>
                </span>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
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
                  <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute px-3 bg-atlas-900 text-[10px] font-mono tracking-wider uppercase text-slate-500">
                  Or Register with Details
                </span>
              </div>

              {/* 2. REGISTRATION FORM FIELDS */}
              <form onSubmit={handleRegister} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Atlas Reed"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 text-xs text-white focus:outline-none placeholder:text-slate-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="atlasreed"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 text-xs text-white focus:outline-none placeholder:text-slate-600 font-mono transition-colors"
                    />
                  </div>
                </div>

                {/* Email ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={emailId}
                      onChange={e => setEmailId(e.target.value)}
                      placeholder="atlas.reed@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 text-xs text-white focus:outline-none placeholder:text-slate-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Create a Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create a Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={createPassword}
                      onChange={e => setCreatePassword(e.target.value)}
                      placeholder="Minimum 6 characters"
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

                {/* Confirm password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Confirm password
                    </label>
                    {passwordsMatch && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </span>
                    )}
                    {passwordsMismatch && (
                      <span className="text-[10px] text-rose-400 font-semibold">
                        Does not match
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3 top-2.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <input
                      type={showRewritePassword ? 'text' : 'password'}
                      required
                      value={rewritePassword}
                      onChange={e => setRewritePassword(e.target.value)}
                      placeholder="Confirm password"
                      className={`w-full pl-9 pr-9 py-2 rounded-xl bg-atlas-950 border text-xs text-white focus:outline-none placeholder:text-slate-600 transition-colors ${
                        passwordsMismatch
                          ? 'border-rose-500 focus:border-rose-400'
                          : passwordsMatch
                          ? 'border-emerald-500 focus:border-emerald-400'
                          : 'border-slate-800 focus:border-cyan-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRewritePassword(!showRewritePassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showRewritePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    checked={acceptTerms}
                    onChange={e => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-atlas-950 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="termsCheck" className="text-[11px] text-slate-400 leading-tight">
                    I accept the ATLAS AI <span className="text-cyan-400 hover:underline">Terms of Service</span> and{' '}
                    <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm hover:shadow-neon-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2 pt-2.5 pb-2.5"
                >
                  {loading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Create Account & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Direct Switch to Log In */}
            <div className="text-center text-xs text-slate-400">
              Already registered?{' '}
              <Link
                href={`/auth/login${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                className="text-cyan-400 font-bold hover:underline"
              >
                Log In to ATLAS AI →
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Home Page / Dashboard Style Interactive Showcase (7 cols on lg) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6 pl-4">
            {/* Header Badge & Hero Title */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-700/50 text-xs font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>INTELLIGENT AI WORKSPACE</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Google Gemini 2.0 Ready</span>
              </div>

              <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
                Your AI. Your Workspace.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 block">
                  Your Possibilities.
                </span>
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Experience full-stack coding, empirical deep research, 6-style neural image generation, and isolated project sandboxes — all within a unified dark navy workspace.
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
                  <span className="text-[11px] text-slate-500 font-mono ml-1.5">atlas-ai://workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-800/40">
                    Model: Gemini 2.0 Flash
                  </span>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="relative flex gap-2 pt-1 border-b border-slate-800 pb-2">
                {[
                  { id: 'chat', label: 'AI Chat', icon: Sparkles },
                  { id: 'code', label: 'Code Architect', icon: Code2 },
                  { id: 'research', label: 'Deep Research', icon: Search },
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
                      <span>How does ATLAS AI enforce database privacy?</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-950/40 border border-cyan-800/40 text-slate-200 font-sans space-y-1">
                      <p className="text-cyan-300 font-bold font-mono">⚡ ATLAS RLS Engine:</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Every user record is isolated via PostgreSQL Row Level Security policies (`auth.uid() = user_id`). Your chats, uploaded documents, and project notes remain strictly private.
                      </p>
                    </div>
                  </div>
                )}

                {previewTab === 'code' && (
                  <div className="space-y-1 text-slate-300">
                    <div className="text-cyan-400">// ATLAS Code Synthesis: High-Concurrency Worker</div>
                    <div className="text-purple-400">export class TaskQueue&lt;T&gt; &#123;</div>
                    <div className="pl-4 text-emerald-300">async dispatch(tasks: T[]): Promise&lt;void&gt; &#123;</div>
                    <div className="pl-8 text-slate-400">// Zero allocation rate-limited streaming pipeline</div>
                    <div className="pl-8 text-cyan-300">await Promise.all(tasks.map(t =&gt; this.exec(t)));</div>
                    <div className="pl-4">&#125;</div>
                    <div>&#125;</div>
                  </div>
                )}

                {previewTab === 'research' && (
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono text-[11px]">
                      <Search className="w-3.5 h-3.5" />
                      <span>EMPIRICAL LITERATURE DOSSIER</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Verified citations cross-referenced with peer-reviewed arXiv & IEEE journals, separating historical evidence from generative deductions.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Metric Chips & Official Instagram Badge */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-0.5">
                <span className="text-lg font-black text-white font-mono">13</span>
                <span className="text-[10px] text-slate-400 block">Functional Tools</span>
              </div>
              <div className="p-3 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-0.5">
                <span className="text-lg font-black text-cyan-400 font-mono">1M+</span>
                <span className="text-[10px] text-slate-400 block">Context Window</span>
              </div>
              <div className="p-3 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-0.5">
                <span className="text-lg font-black text-purple-400 font-mono">100%</span>
                <span className="text-[10px] text-slate-400 block">Private Storage</span>
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

              {/* YouTube Channel Link */}
              <a
                href="https://youtube.com/@atlasreed911?si=PpzNmeCwv3Qo2WIQ"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-gradient-to-r from-red-950/40 via-atlas-900 to-rose-950/30 border border-red-800/50 hover:border-red-500 flex items-center justify-between text-xs transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold group-hover:text-white transition-colors">
                    YouTube
                  </span>
                </div>
                <span className="text-[10px] font-mono text-red-300 font-semibold">@atlasreed911 →</span>
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
