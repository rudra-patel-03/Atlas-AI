'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AtSign, Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mockOtp, setMockOtp] = useState<string | null>(null)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', identifier }),
      })
      const data = await res.json()
      setMessage(data.message || 'Recovery instructions sent.')
      if (data.mockOtp) {
        setMockOtp(data.mockOtp)
      }
      if (data.verifiedEmail) {
        setVerifiedEmail(data.verifiedEmail)
      }
    } catch {
      setMessage('Recovery request dispatched.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-atlas-950 flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <BrandLogo size="lg" showTagline={true} className="justify-center" />
          <h1 className="text-2xl sm:text-3xl font-black text-white pt-2 tracking-tight">
            Password Recovery
          </h1>
          <p className="text-xs text-slate-400">
            Enter your username or email address to reset your password
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-atlas-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
          {message && (
            <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-800 flex flex-col gap-2 text-cyan-300 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>{message}</span>
              </div>
              {mockOtp && (
                <div className="p-2.5 rounded-xl bg-atlas-950 border border-cyan-800/60 font-mono text-center">
                  Verification OTP: <strong className="text-white text-sm tracking-widest">{mockOtp}</strong>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="e.g. atlasreed or atlasreed@atlas.ai"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-atlas-950 border border-slate-800 focus:border-cyan-500 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-neon-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending Code...' : 'Send Recovery Code'}
            </button>

            {mockOtp && (
              <Link
                href={`/auth/reset-password?identifier=${encodeURIComponent(identifier)}&otp=${mockOtp}&email=${encodeURIComponent(verifiedEmail || identifier)}`}
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-cyan-300 bg-atlas-800 hover:bg-atlas-700 text-center block transition-all"
              >
                Proceed to Reset Password →
              </Link>
            )}
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-cyan-400 font-bold hover:underline">
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
