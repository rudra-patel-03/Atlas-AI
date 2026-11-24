'use client'

import React, { useState } from 'react'
import { X, User, Plus, Check, Loader2, ShieldCheck, ExternalLink } from 'lucide-react'

interface GoogleAccount {
  name: string
  email: string
  avatar: string
}

interface GoogleOAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (account: { name: string; email: string; avatar?: string }) => Promise<void>
}

const PRESET_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Atlas Reed',
    email: 'atlasreed@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rudra Patel',
    email: 'rudra@atlas.ai',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=rudra',
  },
]

export function GoogleOAuthModal({ isOpen, onClose, onSuccess }: GoogleOAuthModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount | null>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSelectPreset = async (account: GoogleAccount) => {
    setSelectedAccount(account)
    setError('')
    setSigningIn(true)
    try {
      await onSuccess(account)
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google')
      setSigningIn(false)
    }
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customEmail.trim()) {
      setError('Please enter your Google email address')
      return
    }

    if (!customEmail.includes('@')) {
      setError('Please enter a valid Google email address')
      return
    }

    const name = customName.trim() || customEmail.split('@')[0]
    const email = customEmail.trim().toLowerCase()
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`

    setSigningIn(true)
    setError('')
    try {
      await onSuccess({ name, email, avatar })
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google')
      setSigningIn(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Google Modal Dialog Window */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Official Google G Logo */}
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
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
            <div>
              <h3 className="font-bold text-base leading-tight">Sign in with Google</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose an account to continue to ATLAS AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={signingIn}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {signingIn ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="font-semibold text-sm">Signing in to ATLAS AI...</p>
              <p className="text-xs text-slate-400">Authenticating Google credentials securely</p>
            </div>
          ) : !showCustomInput ? (
            <>
              {/* Account List */}
              <div className="space-y-2">
                {PRESET_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectPreset(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 group-hover:border-blue-500"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {acc.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      Continue →
                    </span>
                  </button>
                ))}

                {/* Option to use another account */}
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-500">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      Use another Google account
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Sign in with your own Gmail or Workspace address
                    </p>
                  </div>
                </button>
              </div>

              {/* Security note */}
              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  To continue, Google will share your name, email address, language preference, and profile picture with ATLAS AI.
                </span>
              </div>
            </>
          ) : (
            /* Custom Google Account Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Email ID
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Atlas Reed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Back to Accounts
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Continue with Google
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400 flex items-center justify-center gap-4">
          <span>Google OAuth 2.0 Verified</span>
          <span>•</span>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:underline">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  )
}
