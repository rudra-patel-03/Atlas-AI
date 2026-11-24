'use client'

import React, { useState } from 'react'
import {
  Volume2,
  Play,
  Square,
  Download,
  Sliders,
  Sparkles,
  Languages,
  Mic2,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function VoiceMakerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [text, setText] = useState('')
  const [voiceName, setVoiceName] = useState('Atlas Neural Core')
  const [language, setLanguage] = useState('en-US')
  const [speed, setSpeed] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generated, setGenerated] = useState(false)

  const voices = [
    { id: 'atlas-neural-male', name: 'Atlas Neural Core (Male)', desc: 'Clear, resonant, authoritative technical cadence' },
    { id: 'atlas-neural-female', name: 'Nova Intelligence (Female)', desc: 'Articulate, energetic, educational presentation' },
    { id: 'orion-studio', name: 'Orion Studio (Baritone)', desc: 'Warm narrative storytelling tone' },
    { id: 'cyber-synthetic', name: 'Cyber Sentinel (Robotic)', desc: 'Slightly stylized cybernetic accent' },
  ]

  const handleSpeak = () => {
    if (!text.trim()) return

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.')
      return
    }

    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speed
    utterance.pitch = pitch
    utterance.lang = language

    utterance.onstart = () => {
      setIsPlaying(true)
      setGenerated(true)
    }
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const handleDownload = () => {
    // Generate text transcript export
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `atlas_voice_script_${Date.now()}.txt`
    a.click()
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
              <Volume2 className="w-6 h-6 text-cyan-400" />
              <span>Atlas Neural Voice Maker</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Synthesize natural, high-fidelity spoken audio with customizable pitch, tempo, and voice personas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Script Input (6 cols) */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Text Script to Synthesize
                </label>
                <textarea
                  rows={6}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type or paste the speech transcript you want ATLAS AI to narrate..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Quick Sample Prompts */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Welcome to ATLAS AI — Chat. Create. Code. Learn.',
                  'System architecture initialized with zero latency degradation.',
                  'The core of deep learning relies on gradient descent in high dimensions.',
                ].map(sample => (
                  <button
                    key={sample}
                    onClick={() => setText(sample)}
                    className="px-2.5 py-1 rounded-lg bg-atlas-950 border border-slate-800 text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-atlas-800 transition-colors"
                  >
                    + {sample.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Sliders: Speed & Pitch */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Speed / Tempo</span>
                    <span className="font-mono text-cyan-400">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speed}
                    onChange={e => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-atlas-950 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Pitch</span>
                    <span className="font-mono text-cyan-400">{pitch.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={pitch}
                    onChange={e => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-atlas-950 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSpeak}
                  disabled={!text.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm transition-all flex items-center justify-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-4 h-4 fill-current text-white" />
                      <span>Pause Speech</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-white" />
                      <span>Synthesize & Play Audio</span>
                    </>
                  )}
                </button>

                {isPlaying && (
                  <button
                    onClick={handleStop}
                    className="px-4 py-3 rounded-xl bg-atlas-800 text-xs font-semibold text-rose-300 hover:bg-rose-950"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>

            {/* Right: Voice Persona & Audio Visualizer (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Persona Selector */}
              <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-3 shadow-xl">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Mic2 className="w-4 h-4 text-cyan-400" />
                  <span>Select Voice Persona</span>
                </span>

                <div className="space-y-2">
                  {voices.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setVoiceName(v.name)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        voiceName === v.name
                          ? 'bg-blue-600/20 border-cyan-500 text-white shadow-neon-sm'
                          : 'bg-atlas-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-100 block">{v.name}</span>
                        <span className="text-[11px] text-slate-500">{v.desc}</span>
                      </div>
                      <Volume2 className={`w-4 h-4 ${voiceName === v.name ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Visualizer & Download Card */}
              <div className="p-6 rounded-2xl bg-atlas-900/80 border border-slate-800 text-center space-y-4 shadow-xl">
                <div className="flex items-center justify-center gap-1.5 h-16">
                  {[40, 70, 25, 90, 50, 100, 30, 80, 60, 45, 95, 35, 75].map((height, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-150 ${
                        isPlaying ? 'animate-pulse' : 'opacity-30'
                      }`}
                      style={{ height: isPlaying ? `${height}%` : '20%' }}
                    />
                  ))}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {isPlaying ? 'Streaming neural speech playback...' : 'Player idle'}
                </div>

                <button
                  onClick={handleDownload}
                  disabled={!text.trim()}
                  className="px-5 py-2.5 rounded-xl bg-atlas-800 hover:bg-atlas-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all inline-flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Speech Transcript</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
