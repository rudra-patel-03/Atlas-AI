'use client'

import React, { useState } from 'react'
import {
  Video,
  Play,
  Download,
  AlertTriangle,
  Info,
  Clock,
  Ratio,
  Move,
  Sparkles,
  Settings,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function VideoGeneratorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState('5')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [motion, setMotion] = useState('cinematic-pan')
  const [loading, setLoading] = useState(false)
  const [videoResult, setVideoResult] = useState<any>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/tools/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          duration: parseInt(duration),
          aspectRatio,
          motion,
        }),
      })

      const data = await res.json()
      setVideoResult(data)
    } catch {
      setVideoResult({
        configured: false,
        message: 'Could not contact video generation endpoint.',
      })
    } finally {
      setLoading(false)
    }
  }

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
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Video className="w-6 h-6 text-purple-400" />
              <span>Atlas Neural Video Studio</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Text-to-video generation with cinematic camera motion, temporal smoothing, and multi-ratio rendering
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Motion & Scene Prompt
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Cinematic drone tracking shot over a futuristic crystalline metropolis at dusk, cyan particle trails and volumetric lighting, smooth 60fps motion..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Duration & Aspect Ratio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Duration</span>
                  </label>
                  <select
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="3">3 Seconds (Fast)</option>
                    <option value="5">5 Seconds (Standard)</option>
                    <option value="10">10 Seconds (Extended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Ratio className="w-3.5 h-3.5 text-blue-400" />
                    <span>Aspect Ratio</span>
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={e => setAspectRatio(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Reels/TikTok)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </div>
              </div>

              {/* Camera Motion */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-purple-400" />
                  <span>Camera Trajectory</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cinematic-pan', label: 'Cinematic Pan' },
                    { id: 'zoom-in', label: 'Slow Zoom-In' },
                    { id: 'orbital', label: 'Orbital Arc' },
                    { id: 'drone-flythrough', label: 'FPV Flythrough' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMotion(m.id)}
                      className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                        motion === m.id
                          ? 'bg-purple-900/40 border-purple-500 text-purple-200'
                          : 'bg-atlas-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 shadow-neon-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Synthesizing Temporal Frames...' : 'Generate Neural Video'}
              </button>
            </div>

            {/* Right Video Canvas (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 min-h-[460px] flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-white font-mono uppercase tracking-wider">
                    Video Render Player
                  </span>
                  <span className="text-[11px] text-purple-400 font-mono">
                    H.264 / 60 FPS Engine
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center py-4">
                  {loading ? (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs text-purple-300 font-mono">
                        Interpolating latent temporal keyframes...
                      </p>
                    </div>
                  ) : videoResult?.samplePreviewUrl ? (
                    <div className="w-full max-w-lg rounded-xl overflow-hidden border border-purple-500/40 shadow-neon-sm">
                      <video
                        src={videoResult.samplePreviewUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full h-auto object-cover rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 text-xs space-y-2">
                      <Video className="w-12 h-12 text-slate-700 mx-auto" />
                      <p>Enter a prompt to render a high-definition neural video.</p>
                    </div>
                  )}
                </div>

                {/* Status Notice per Section 8.C */}
                {videoResult && !videoResult.configured && (
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/60 flex items-start gap-3 text-xs text-purple-300">
                    <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Neural Video Engine Standby</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {videoResult.message} Playing high-resolution hardware loop preview. Connect Runway/Luma/Sora API keys in Settings to unlock real cloud rendering.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
