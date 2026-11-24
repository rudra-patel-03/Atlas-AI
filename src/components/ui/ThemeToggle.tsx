'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Laptop, Check, ChevronDown } from 'lucide-react'

export type ThemeMode = 'dark' | 'light' | 'system'

interface ThemeToggleProps {
  variant?: 'button' | 'segmented' | 'dropdown'
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({
  variant = 'button',
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize theme from localStorage or document attribute
  useEffect(() => {
    setMounted(true)
    const savedTheme = (localStorage.getItem('atlas_theme') as ThemeMode) || 'dark'
    setTheme(savedTheme)
    applyTheme(savedTheme)

    // Listen to OS system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const currentStored = localStorage.getItem('atlas_theme')
      if (currentStored === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark)

    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }

    root.setAttribute('data-theme', mode)
    localStorage.setItem('atlas_theme', mode)
    setTheme(mode)
  }

  const handleSelect = (mode: ThemeMode) => {
    applyTheme(mode)
    setIsOpen(false)
  }

  // Quick cycle for single button click
  const cycleTheme = () => {
    if (theme === 'dark') handleSelect('light')
    else if (theme === 'light') handleSelect('system')
    else handleSelect('dark')
  }

  if (!mounted) {
    return (
      <div className={`p-2 rounded-xl border border-slate-800 bg-atlas-900/60 text-slate-400 ${className}`}>
        <Moon className="w-4 h-4 animate-pulse" />
      </div>
    )
  }

  // 1. SEGMENTED CONTROL (e.g., for Settings / Large headers)
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 rounded-2xl bg-atlas-900/90 border border-slate-800 shadow-inner ${className}`}>
        <button
          type="button"
          onClick={() => handleSelect('light')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            theme === 'light'
              ? 'bg-blue-600 text-white shadow-neon-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-atlas-800/50'
          }`}
          title="Light Mode"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('dark')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            theme === 'dark'
              ? 'bg-blue-600 text-white shadow-neon-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-atlas-800/50'
          }`}
          title="Dark Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('system')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            theme === 'system'
              ? 'bg-blue-600 text-white shadow-neon-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-atlas-800/50'
          }`}
          title="Device Mode (System Preference)"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Device</span>
        </button>
      </div>
    )
  }

  // 2. BUTTON WITH DROPDOWN MENU (Default for Navbars & Headers)
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-atlas-900/70 hover:bg-atlas-800 text-slate-300 hover:text-white transition-all shadow-sm"
        title={`Current mode: ${theme} (Click to switch)`}
      >
        {theme === 'dark' && <Moon className="w-4 h-4 text-cyan-400" />}
        {theme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
        {theme === 'system' && <Laptop className="w-4 h-4 text-blue-400" />}

        {showLabel && (
          <span className="hidden sm:inline-block text-xs font-medium capitalize">
            {theme === 'system' ? 'Device' : theme}
          </span>
        )}

        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-800 bg-atlas-900/95 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-slate-800/80 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Appearance Mode
            </span>
          </div>

          {/* Light Mode Option */}
          <button
            type="button"
            onClick={() => handleSelect('light')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
              theme === 'light'
                ? 'bg-blue-600/20 text-cyan-300 font-semibold border border-blue-500/30'
                : 'text-slate-300 hover:bg-atlas-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="block font-medium">Light Mode</span>
                <span className="text-[10px] text-slate-400">Crisp daylight theme</span>
              </div>
            </div>
            {theme === 'light' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Dark Mode Option */}
          <button
            type="button"
            onClick={() => handleSelect('dark')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
              theme === 'dark'
                ? 'bg-blue-600/20 text-cyan-300 font-semibold border border-blue-500/30'
                : 'text-slate-300 hover:bg-atlas-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <span className="block font-medium">Dark Mode</span>
                <span className="text-[10px] text-slate-400">Deep navy & cyber cyan</span>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Device / System Mode Option */}
          <button
            type="button"
            onClick={() => handleSelect('system')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
              theme === 'system'
                ? 'bg-blue-600/20 text-cyan-300 font-semibold border border-blue-500/30'
                : 'text-slate-300 hover:bg-atlas-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <span className="block font-medium">Device Mode</span>
                <span className="text-[10px] text-slate-400">Match OS system theme</span>
              </div>
            </div>
            {theme === 'system' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      )}
    </div>
  )
}
