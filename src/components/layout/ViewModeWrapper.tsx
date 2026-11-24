'use client'

import React, { useState } from 'react'
import {
  Smartphone,
  Monitor,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  Wifi,
  Battery,
  Sparkles,
} from 'lucide-react'
import { useViewMode, DEVICE_PRESETS, DevicePreset } from '@/context/ViewModeContext'

export function ViewModeWrapper({ children }: { children: React.ReactNode }) {
  const {
    viewMode,
    setViewMode,
    toggleViewMode,
    devicePreset,
    setDevicePreset,
    zoomScale,
    setZoomScale,
    isMobileDevice,
  } = useViewMode()

  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false)
  const currentDevice = DEVICE_PRESETS[devicePreset]

  // If user is already on a physical phone, render naturally
  if (isMobileDevice) {
    return (
      <>
        {children}
        {/* Floating Toggle for Physical Mobile */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={toggleViewMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-atlas-900/90 hover:bg-atlas-800 border border-blue-500/40 text-xs font-semibold text-cyan-300 shadow-2xl backdrop-blur-xl transition-all active:scale-95"
            title="Toggle View Mode"
          >
            {viewMode === 'web' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span>{viewMode === 'web' ? 'Mobile View' : 'Web View'}</span>
          </button>
        </div>
      </>
    )
  }

  // If Desktop user is in standard "Web View", render normally with floating quick-switch dock
  if (viewMode === 'web') {
    return (
      <>
        {children}

        {/* Floating Quick View Mode Switcher Pill */}
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={() => setViewMode('mobile')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-atlas-900/95 hover:bg-atlas-800 border border-blue-500/50 hover:border-cyan-400 text-xs font-bold text-cyan-300 hover:text-white shadow-2xl hover:shadow-neon-sm backdrop-blur-xl transition-all group active:scale-95"
            title="Switch to Simulated Mobile View"
          >
            <div className="w-5 h-5 rounded-lg bg-blue-600/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <span>Switch to Mobile View</span>
          </button>
        </div>
      </>
    )
  }

  // If Desktop user has activated "Mobile View": Render interactive smartphone device frame!
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-4 px-2 select-none relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none opacity-40" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* TOP CONTROL BAR: View Mode Switcher Toolbar */}
      <header className="sticky top-2 z-50 w-full max-w-2xl mx-auto mb-4 px-4 py-2 rounded-2xl bg-atlas-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-3">
        {/* Left: Active View Badge */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-neon-sm">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white block leading-tight">Mobile View Active</span>
            <span className="text-[10px] text-cyan-400 font-mono">{currentDevice.name} ({currentDevice.label})</span>
          </div>
        </div>

        {/* Center: Device Presets & Zoom */}
        <div className="hidden sm:flex items-center gap-1.5 bg-atlas-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
          {/* Preset Selector */}
          <div className="relative">
            <button
              onClick={() => setDeviceMenuOpen(!deviceMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-atlas-800 text-slate-300 font-medium transition-colors"
            >
              <span>{currentDevice.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {deviceMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-slate-800 bg-atlas-900 shadow-2xl p-1 z-50 backdrop-blur-xl">
                {(Object.keys(DEVICE_PRESETS) as DevicePreset[]).map(key => {
                  const d = DEVICE_PRESETS[key]
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setDevicePreset(key)
                        setDeviceMenuOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        devicePreset === key
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-atlas-800'
                      }`}
                    >
                      <span className="block font-medium">{d.name}</span>
                      <span className="text-[10px] opacity-75">{d.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="w-px h-3 bg-slate-800" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoomScale(Math.max(0.75, zoomScale - 0.05))}
            className="p-1 rounded hover:bg-atlas-800 text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] text-slate-400 w-8 text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale(Math.min(1.15, zoomScale + 0.05))}
            className="p-1 rounded hover:bg-atlas-800 text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Switch Back to Web View Button */}
        <button
          type="button"
          onClick={() => setViewMode('web')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-neon-sm hover:shadow-neon-blue transition-all"
          title="Return to Full Web View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Switch to Web View</span>
        </button>
      </header>

      {/* THE SMARTPHONE DEVICE SHELL */}
      <div
        className="relative transition-transform duration-200 ease-out my-auto"
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Device Exterior Chassis / Bezel */}
        <div
          className="relative rounded-[50px] p-[10px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_25px_70px_rgba(0,102,255,0.25),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-black/80"
          style={{
            width: `${currentDevice.width + 20}px`,
            height: 'min(860px, calc(100vh - 80px))',
            minHeight: '600px',
          }}
        >
          {/* Side Hardware Buttons */}
          <div className="absolute -left-[13px] top-24 w-[3px] h-8 bg-slate-600 rounded-l" />
          <div className="absolute -left-[13px] top-36 w-[3px] h-12 bg-slate-600 rounded-l" />
          <div className="absolute -left-[13px] top-52 w-[3px] h-12 bg-slate-600 rounded-l" />
          <div className="absolute -right-[13px] top-32 w-[3px] h-16 bg-slate-600 rounded-r" />

          {/* Inner Screen Display */}
          <div
            className="w-full h-full rounded-[42px] bg-atlas-950 overflow-hidden relative flex flex-col border border-slate-800/80 shadow-inner"
          >
            {/* Top Status Bar & Dynamic Island */}
            <div className="h-8 w-full bg-atlas-950/90 backdrop-blur-md px-6 flex items-center justify-between z-40 shrink-0 text-[10px] font-semibold text-slate-300 border-b border-slate-900/60">
              {/* Clock */}
              <span>9:41</span>

              {/* Dynamic Island Pill */}
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-between px-2 text-[9px] text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[8px] tracking-tight">ATLAS</span>
                <span className="w-2 h-2 rounded-full border border-cyan-400/60" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-slate-300" />
                <Battery className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            {/* The Actual Application Viewport */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative select-text device-viewport">
              {children}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="h-4 w-full bg-atlas-950 shrink-0 flex items-center justify-center z-40">
              <div className="w-32 h-1 bg-slate-500/70 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
