'use client'

import React from 'react'
import { Smartphone, Monitor } from 'lucide-react'
import { useViewMode } from '@/context/ViewModeContext'

interface ViewModeToggleProps {
  variant?: 'button' | 'segmented' | 'icon'
  className?: string
  showLabel?: boolean
}

export function ViewModeToggle({
  variant = 'button',
  className = '',
  showLabel = true,
}: ViewModeToggleProps) {
  const { viewMode, setViewMode, toggleViewMode } = useViewMode()

  // 1. SEGMENTED CONTROL (e.g. for Settings & Large Menus)
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 rounded-2xl bg-atlas-900/90 border border-slate-800 shadow-inner ${className}`}>
        <button
          type="button"
          onClick={() => setViewMode('web')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            viewMode === 'web'
              ? 'bg-blue-600 text-white shadow-neon-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-atlas-800/50'
          }`}
          title="Full Desktop Web View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Web View</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            viewMode === 'mobile'
              ? 'bg-blue-600 text-white shadow-neon-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-atlas-800/50'
          }`}
          title="Interactive Mobile View"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile View</span>
        </button>
      </div>
    )
  }

  // 2. COMPACT ICON BUTTON
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleViewMode}
        className={`p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-atlas-900/70 hover:bg-atlas-800 text-slate-300 hover:text-white transition-all shadow-sm ${className}`}
        title={`Current: ${viewMode === 'web' ? 'Web View' : 'Mobile View'} (Click to toggle)`}
      >
        {viewMode === 'web' ? (
          <Smartphone className="w-4 h-4 text-cyan-400" />
        ) : (
          <Monitor className="w-4 h-4 text-blue-400" />
        )}
      </button>
    )
  }

  // 3. DEFAULT BUTTON WITH ICON & LABEL (For Headers & Navbars)
  return (
    <button
      type="button"
      onClick={toggleViewMode}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-blue-500/50 bg-atlas-900/70 hover:bg-atlas-800 text-slate-300 hover:text-white transition-all shadow-sm group ${className}`}
      title={`Currently viewing in ${viewMode === 'web' ? 'Desktop Web View' : 'Mobile View'}. Click to switch.`}
    >
      {viewMode === 'web' ? (
        <>
          <Smartphone className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
          {showLabel && (
            <span className="hidden xl:inline-block text-xs font-medium text-slate-300 group-hover:text-cyan-300 view-mode-label whitespace-nowrap">
              Mobile View
            </span>
          )}
        </>
      ) : (
        <>
          <Monitor className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
          {showLabel && (
            <span className="hidden xl:inline-block text-xs font-medium text-slate-300 group-hover:text-blue-300 view-mode-label whitespace-nowrap">
              Web View
            </span>
          )}
        </>
      )}
    </button>
  )
}
