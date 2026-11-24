'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneCall,
  PhoneOff,
  Radio,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BrandLogo } from '@/components/ui/BrandLogo'

interface VoiceExchange {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

export default function VoiceChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLiveSession, setIsLiveSession] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [statusText, setStatusText] = useState('Click "Start Voice Session" to speak hands-free with ATLAS AI')
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [exchanges, setExchanges] = useState<VoiceExchange[]>([])

  const recognitionRef = useRef<any>(null)

  // Start Voice Session
  const toggleLiveSession = () => {
    if (isLiveSession) {
      // End session
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsLiveSession(false)
      setIsListening(false)
      setIsSpeaking(false)
      setStatusText('Voice session ended.')
    } else {
      // Start session
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Web Speech recognition is not supported in this browser. Please use Chrome or Edge.')
        return
      }

      setIsLiveSession(true)
      startListening()
    }
  }

  const startListening = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onstart = () => {
        setIsListening(true)
        setStatusText('Listening... Speak naturally.')
      }

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('')
        setCurrentTranscript(transcript)
      }

      rec.onend = () => {
        setIsListening(false)
        if (currentTranscript.trim()) {
          processSpokenQuery(currentTranscript)
          setCurrentTranscript('')
        } else if (isLiveSession) {
          // Restart listening loop if session still active
          setStatusText('Waiting for your voice...')
        }
      }

      rec.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
      rec.start()
    } catch {
      setIsListening(false)
    }
  }

  // Send query to AI and speak back answer
  const processSpokenQuery = async (queryText: string) => {
    setStatusText('ATLAS AI is reasoning...')
    const userExchange: VoiceExchange = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString(),
    }
    setExchanges(prev => [userExchange, ...prev])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          systemPrompt: 'You are Atlas Voice Assistant. Answer in 2-3 spoken, clear, natural conversational sentences. Do not use markdown or emojis since your response is being read aloud.',
        }),
      })

      const rawText = await res.text()
      const assistantText = rawText || "I'm ready. How else can I help you?"

      const astExchange: VoiceExchange = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString(),
      }
      setExchanges(prev => [astExchange, ...prev])

      // Speak aloud
      speakResponse(assistantText)
    } catch {
      setStatusText('Could not complete audio reasoning.')
    }
  }

  const speakResponse = (reply: string) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(reply)
    utterance.rate = 1.05
    utterance.pitch = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
      setStatusText('Speaking response...')
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setStatusText('Ready for next query. Click microphone or speak.')
      // Resume listening
      if (isLiveSession) {
        setTimeout(startListening, 600)
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-atlas-950 text-slate-100 flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          } p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8 flex flex-col items-center justify-between min-h-[calc(100vh-5rem)]`}
        >
          {/* Header */}
          <div className="text-center space-y-2 w-full pb-4 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
              <span>Atlas Live Conversational Voice Chat</span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time hands-free bidirectional audio with speech recognition and speech synthesis
            </p>
          </div>

          {/* Central Interactive Voice Orb */}
          <div className="flex flex-col items-center justify-center space-y-6 my-auto">
            <div className="relative group flex items-center justify-center">
              {/* Pulsing visual circles */}
              <div
                className={`absolute w-64 h-64 rounded-full transition-all duration-500 ${
                  isSpeaking
                    ? 'bg-cyan-500/25 blur-3xl scale-125 animate-pulse'
                    : isListening
                    ? 'bg-rose-500/25 blur-3xl scale-110 animate-ping'
                    : 'bg-blue-600/15 blur-2xl'
                }`}
              />

              <div
                className={`relative w-44 h-44 rounded-full border-2 transition-all duration-300 flex items-center justify-center p-1 bg-atlas-900 shadow-2xl ${
                  isSpeaking
                    ? 'border-cyan-400 shadow-neon-cyan'
                    : isListening
                    ? 'border-rose-500 shadow-lg ring-4 ring-rose-500/20'
                    : 'border-blue-600/60 shadow-neon-blue'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center bg-black">
                  <img
                    src="/assets/logo.jpg"
                    alt="ATLAS AI Logo"
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isSpeaking ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[1px]" />

                  {/* Icon overlay */}
                  <div className="absolute z-10 p-3 rounded-full bg-atlas-950/70 border border-slate-700">
                    {isSpeaking ? (
                      <Volume2 className="w-7 h-7 text-cyan-400 animate-pulse" />
                    ) : isListening ? (
                      <Mic className="w-7 h-7 text-rose-400 animate-bounce" />
                    ) : (
                      <Mic className="w-7 h-7 text-blue-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-1">
              <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
                {statusText}
              </span>
              {currentTranscript && (
                <p className="text-xs text-slate-300 italic max-w-md">
                  "{currentTranscript}"
                </p>
              )}
            </div>

            {/* Session Call Toggle Button */}
            <button
              onClick={toggleLiveSession}
              className={`px-8 py-3.5 rounded-full font-bold text-xs transition-all flex items-center gap-2 shadow-xl ${
                isLiveSession
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-neon-blue'
              }`}
            >
              {isLiveSession ? (
                <>
                  <PhoneOff className="w-4 h-4" />
                  <span>End Voice Session</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Start Live Voice Session</span>
                </>
              )}
            </button>
          </div>

          {/* Transcript History Drawer */}
          {exchanges.length > 0 && (
            <div className="w-full rounded-2xl bg-atlas-900/80 border border-slate-800 p-4 space-y-2 max-h-48 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                Session Spoken Log:
              </span>
              <div className="space-y-2 text-xs">
                {exchanges.map(ex => (
                  <div
                    key={ex.id}
                    className={`p-2.5 rounded-xl ${
                      ex.role === 'user'
                        ? 'bg-atlas-950 border border-slate-800 text-slate-300'
                        : 'bg-blue-950/40 border border-cyan-800/40 text-cyan-200'
                    }`}
                  >
                    <span className="font-bold text-[10px] text-slate-400 uppercase font-mono mr-2">
                      {ex.role === 'user' ? 'You' : 'ATLAS'}:
                    </span>
                    <span>{ex.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
