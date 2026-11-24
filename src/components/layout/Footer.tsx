import React from 'react'
import Link from 'next/link'
import { BrandLogo } from '@/components/ui/BrandLogo'

export const Footer: React.FC = () => {
  const socials = [
    { name: 'WhatsApp Group', handle: 'Atlas Reed WhatsApp Group', href: 'https://chat.whatsapp.com/KGhDiWhqU7lEmBBFygs5QX?s=cl&p=a&iam=2' },
    { name: 'Facebook', handle: 'Facebook Share', href: 'https://www.facebook.com/share/1KAsUKGabD/' },
    { name: 'Telegram', handle: 't.me/atlasreed04', href: 'https://t.me/atlasreed04' },
    { name: 'YouTube', handle: '@atlasreed911', href: 'https://youtube.com/@atlasreed911?si=PpzNmeCwv3Qo2WIQ' },
    { name: 'GitHub', handle: 'atlasreed911', href: 'https://github.com/atlasreed911' },
    { name: 'Instagram', handle: '@atlas.ai.tools', href: 'https://instagram.com/atlas.ai.tools' },
    { name: 'X / Twitter', handle: '@atlas_ai_tools', href: 'https://x.com/atlas_ai_tools' },
    { name: 'Discord', handle: 'Atlas Builders', href: 'https://discord.gg/atlas-ai' },
    { name: 'LinkedIn', handle: 'ATLAS AI Workspace', href: 'https://linkedin.com/company/atlas-ai-workspace' },
  ]

  return (
    <footer className="border-t border-slate-800/80 bg-atlas-950 text-slate-400 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <BrandLogo size="md" showTagline={true} />
            <p className="text-xs text-slate-400 leading-relaxed">
              Your intelligent AI workspace for learning, coding, creating, researching, and everyday productivity.
            </p>
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Official Community & Socials</span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://chat.whatsapp.com/KGhDiWhqU7lEmBBFygs5QX?s=cl&p=a&iam=2"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-xs font-semibold text-emerald-300 hover:text-white transition-all shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  WhatsApp Group
                </a>
                <a
                  href="https://www.facebook.com/share/1KAsUKGabD/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-700/60 text-xs font-semibold text-blue-300 hover:text-white transition-all shadow-sm"
                >
                  Facebook
                </a>
                <a
                  href="https://t.me/atlasreed04"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-xs font-semibold text-cyan-300 hover:text-white transition-all shadow-sm"
                >
                  Telegram
                </a>
              </div>
              <Link
                href="/community"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline block pt-0.5"
              >
                Explore Full Social Media Hub →
              </Link>
            </div>
          </div>

          {/* Core Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">AI Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/chat" className="hover:text-cyan-400 transition-colors">AI Chat & Reasoning</Link></li>
              <li><Link href="/tools/code" className="hover:text-cyan-400 transition-colors">Code Generator</Link></li>
              <li><Link href="/tools/image" className="hover:text-cyan-400 transition-colors">Image Generator</Link></li>
              <li><Link href="/tools/research" className="hover:text-cyan-400 transition-colors">Deep Research</Link></li>
              <li><Link href="/agents" className="hover:text-cyan-400 transition-colors">AI Agents</Link></li>
              <li><Link href="/projects" className="hover:text-cyan-400 transition-colors">Project Workspaces</Link></li>
            </ul>
          </div>

          {/* Productivity Tools */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Productivity Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/tools/pdf" className="hover:text-cyan-400 transition-colors">PDF Maker</Link></li>
              <li><Link href="/tools/doc-assistant" className="hover:text-cyan-400 transition-colors">Document Assistant</Link></li>
              <li><Link href="/tools/summarizer" className="hover:text-cyan-400 transition-colors">Summarizer</Link></li>
              <li><Link href="/tools/notes" className="hover:text-cyan-400 transition-colors">Notes Generator</Link></li>
              <li><Link href="/tools/translator" className="hover:text-cyan-400 transition-colors">Polyglot Translator</Link></li>
              <li><Link href="/tools/prompt" className="hover:text-cyan-400 transition-colors">Prompt Generator</Link></li>
              <li><Link href="/tools/voice" className="hover:text-cyan-400 transition-colors">Voice Maker & Chat</Link></li>
            </ul>
          </div>

          {/* Enterprise & Security */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Security & Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-300">Dual-layer PostgreSQL + RLS</span></li>
              <li><span className="text-slate-300">Google Gemini 2.0 & OpenAI</span></li>
              <li><span className="text-slate-300">End-to-End User Data Isolation</span></li>
              <li><Link href="/admin" className="hover:text-cyan-400 transition-colors">Admin Telemetry</Link></li>
              <li><Link href="/settings" className="hover:text-cyan-400 transition-colors">System Preferences</Link></li>
              <li><Link href="/help" className="hover:text-cyan-400 transition-colors">Help & Documentation</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Links Grid */}
        <div className="py-6 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-300">Connect with ATLAS AI:</span>
            <div className="flex flex-wrap gap-2">
              {socials.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-md bg-atlas-900 border border-slate-800 hover:border-blue-500/50 hover:text-white transition-all text-[11px]"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ATLAS AI Platform. All rights reserved. Built for high-velocity productivity.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
