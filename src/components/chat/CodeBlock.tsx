'use client'

import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  language?: string
  code: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'typescript', code }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.trim().split('\n')

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-atlas-950 font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-atlas-900 border-b border-slate-800 text-slate-400">
        <span className="font-semibold text-[11px] text-cyan-400 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:text-white hover:bg-atlas-800 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3.5 overflow-x-auto leading-relaxed text-slate-200">
        <pre className="table">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row">
              <span className="table-cell select-none pr-4 text-slate-600 text-right text-[11px]">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
