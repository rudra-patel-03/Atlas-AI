'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Lock,
  User,
  AtSign,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  UserCheck,
  X,
  ExternalLink,
} from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { GoogleOAuthModal } from '@/components/auth/GoogleOAuthModal'

interface CompulsoryAuthModalProps {
  isOpen: boolean
  onClose?: () => void
  redirectTarget?: string
  featureName?: string
  onSuccess?: () => void
}

export const CompulsoryAuthModal: React.FC<CompulsoryAuthModalProps> = ({
  isOpen,
  onClose,
  redirectTarget = '/chat',
  featureName = 'AI Chat & Tools',
  onSuccess,
}) => {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Signup form state
  const [fullName, setFullName] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

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

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials. Please verify your login.')
      }

      setSuccess('Access verified! Entering ATLAS workspace...')
      setTimeout(() => {
        if (onSuccess) onSuccess()
        window.location.href = redirectTarget
      }, 200)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim() || !signupUsername.trim() || !signupEmail.trim() || !signupPassword) {
      setError('Please fill in all registration fields.')
      return
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
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
          username: signupUsername.toLowerCase().trim(),
          email: signupEmail.toLowerCase().trim(),
          password: signupPassword,
          confirmPassword: confirmPassword,
          acceptTerms: true,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.')
      }

      setSuccess('Account created! Entering ATLAS workspace...')
      setTimeout(() => {
        if (onSuccess) onSuccess()
        window.location.href = redirectTarget
      }, 200)
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

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
        if (onSuccess) onSuccess()
        window.location.href = redirectTarget
      }, 200)
    } catch (err: any) {
      setError(err.message || 'Google authentication error.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div
          className="relative w-full max-w-md rounded-3xl bg-atlas-900/95 border border-cyan-500/40 shadow-2xl p-6 sm:p-7 text-slate-100 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button (if modal is dismissible) */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-atlas-800 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="text-center space-y-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-[11px] font-mono text-cyan-300">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Authentication Compulsory</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sign In to Continue
            </h2>
            <p className="text-xs text-slate-400">
              Sign in or create an account to access <strong className="text-cyan-300">{featureName}</strong>.
            </p>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="p-3 mb-3 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-start gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 mb-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 flex items-start gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Switcher Tabs: Log In vs Sign In / Register */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-atlas-950 border border-slate-800/80 text-xs font-semibold text-center mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-atlas-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError('')
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-atlas-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In / Register</span>
            </button>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 mb-4 rounded-xl border border-slate-700 bg-atlas-950 hover:bg-atlas-800 text-slate-100 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm hover:border-slate-500 disabled:opacity-50"
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
            <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center mb-4">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute px-2.5 bg-atlas-900 text-[10px] font-mono tracking-wider uppercase text-slate-500">
              Or with credentials
            </span>
          </div>

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
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
                    placeholder="Enter your username or email"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder:text-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder:text-slate-600 transition-colors"
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

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <span>Logging In...</span> : <span>Log In to Workspace</span>}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder:text-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={e => setSignupUsername(e.target.value)}
                    placeholder="Choose unique username"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder:text-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder:text-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="Create strong password"
                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder:text-slate-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder:text-slate-600 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <span>Creating Account...</span> : <span>Create Account & Sign In</span>}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Footer link to dedicated page */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              <span>Open dedicated login page in full window</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Google OAuth Account Picker */}
      <GoogleOAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleAccountSelected}
      />
    </>
  )
}
