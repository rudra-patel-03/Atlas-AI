'use client'

import React, { useState } from 'react'
import {
  Search,
  BookOpen,
  Sparkles,
  Link2,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  FileCheck2,
  RefreshCw,
  Layers,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

interface ResearchStep {
  step: string
  status: string
  details: string
}

export default function DeepResearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [topic, setTopic] = useState('Scalability bottlenecks in distributed consensus and BFT protocols')
  const [depth, setDepth] = useState('Deep Dive')
  const [domain, setDomain] = useState('Computer Science & Cryptography')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState('')
  const [steps, setSteps] = useState<ResearchStep[]>([])
  const [copied, setCopied] = useState(false)

  const handleResearch = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setReport('')
    setSteps([])

    try {
      const res = await fetch('/api/tools/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, depth, domain }),
      })

      const data = await res.json()
      if (data.report) {
        setReport(data.report)
        setSteps(data.researchSteps || [])
      } else if (data.error) {
        setReport(`⚠️ ${data.error}`)
      }
    } catch {
      setReport('Failed to execute deep research investigation.')
    } finally {
      setLoading(false)
    }
  }

  const copyReport = () => {
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              <Search className="w-6 h-6 text-cyan-400" />
              <span>Atlas Deep Research & Verification Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-source literature investigation with verified peer-reviewed citations and explicit fact vs conclusion separation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Query Configuration (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Research Inquiry / Hypothesis
                </label>
                <textarea
                  rows={4}
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Impact of speculative execution on modern microarchitectures and hardware side-channel mitigations..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Investigation Depth
                  </label>
                  <select
                    value={depth}
                    onChange={e => setDepth(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Overview">Executive Overview</option>
                    <option value="Deep Dive">Rigorous Deep Dive</option>
                    <option value="Exhaustive Literature Audit">Exhaustive Literature Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Knowledge Domain
                  </label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Computer Science & Cryptography">CS & Cryptography</option>
                    <option value="Medicine & Biology">Biomedical Sciences</option>
                    <option value="Physics & Mathematics">Physics & Math</option>
                    <option value="Economics & Finance">Economics & Finance</option>
                    <option value="All Domains">Multidisciplinary</option>
                  </select>
                </div>
              </div>

              {/* Research Methodology Guarantee Badge */}
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Empirical Integrity Protocol</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Atlas strictly separates verifiable historical evidence from predictive hypotheses. Sourced citations reference established standards (IEEE, ACM, arXiv, Nature).
                </p>
              </div>

              <button
                onClick={handleResearch}
                disabled={loading || !topic.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Multi-Pass Research...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Deep Investigation</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Report Canvas (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Execution Progress Trackers */}
              {steps.length > 0 && (
                <div className="p-4 rounded-2xl bg-atlas-900/60 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                    Execution Milestones:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {steps.map((st, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-atlas-950 border border-slate-800/80 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{st.step}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{st.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Dossier Card */}
              <div className="p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 shadow-xl flex flex-col justify-between min-h-[460px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-cyan-400" />
                      <span>Formal Research Dossier</span>
                    </span>

                    {report && (
                      <button
                        onClick={copyReport}
                        className="px-2.5 py-1 rounded-lg bg-atlas-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Report</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                      <p className="text-xs text-cyan-300 font-mono">
                        Querying academic corpora & disambiguating facts from hypotheses...
                      </p>
                    </div>
                  ) : report ? (
                    <div className="p-4 rounded-xl bg-atlas-950 border border-slate-800 max-h-[500px] overflow-y-auto leading-relaxed text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-sans">
                      {report}
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs space-y-2">
                      <Search className="w-10 h-10 text-slate-700" />
                      <p>Enter an academic or technical inquiry to generate a structured research paper with citations.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
