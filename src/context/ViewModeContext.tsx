'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type ViewMode = 'web' | 'mobile'
export type DevicePreset = 'iphone' | 'pixel' | 'compact'

interface DeviceDimension {
  name: string
  width: number
  height: number
  label: string
}

export const DEVICE_PRESETS: Record<DevicePreset, DeviceDimension> = {
  iphone: { name: 'iPhone 16 Pro', width: 393, height: 852, label: '393 × 852' },
  pixel: { name: 'Google Pixel 9', width: 412, height: 915, label: '412 × 915' },
  compact: { name: 'Compact SE', width: 375, height: 740, label: '375 × 740' },
}

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
  devicePreset: DevicePreset
  setDevicePreset: (preset: DevicePreset) => void
  zoomScale: number
  setZoomScale: (scale: number) => void
  isMobileDevice: boolean
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('web')
  const [devicePreset, setDevicePresetState] = useState<DevicePreset>('iphone')
  const [zoomScale, setZoomScale] = useState<number>(1)
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)

  useEffect(() => {
    // Detect physical screen width
    const checkPhysicalScreen = () => {
      const isNarrow = window.innerWidth < 1024
      const isPhone = window.innerWidth <= 640
      setIsMobileDevice(isPhone)

      // Auto-adjust sidebar for viewport size
      if (isNarrow) {
        setSidebarOpen(false)
      } else {
        const currentMode = (localStorage.getItem('atlas_view_mode') as ViewMode) || 'web'
        if (currentMode === 'web') {
          setSidebarOpen(true)
        }
      }
    }

    checkPhysicalScreen()
    window.addEventListener('resize', checkPhysicalScreen)

    // Load saved view mode preference
    const saved = localStorage.getItem('atlas_view_mode') as ViewMode | null
    const initialMode = saved === 'mobile' || saved === 'web' ? saved : 'web'
    setViewModeState(initialMode)
    document.documentElement.setAttribute('data-view-mode', initialMode)

    if (initialMode === 'mobile' || window.innerWidth < 1024) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }

    const savedDevice = localStorage.getItem('atlas_device_preset') as DevicePreset | null
    if (savedDevice && DEVICE_PRESETS[savedDevice]) {
      setDevicePresetState(savedDevice)
    }

    return () => window.removeEventListener('resize', checkPhysicalScreen)
  }, [])

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
    localStorage.setItem('atlas_view_mode', mode)
    document.documentElement.setAttribute('data-view-mode', mode)

    // Auto-adjust sidebar based on mode
    if (mode === 'mobile') {
      setSidebarOpen(false) // Mobile should start with clean canvas, no blocking drawer
    } else {
      setSidebarOpen(window.innerWidth >= 1024) // Desktop restores standard docked sidebar
    }

    // Trigger event for dynamic responsive components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('atlas-viewmode-change', {
          detail: { viewMode: mode, isMobile: mode === 'mobile' },
        })
      )
    }
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === 'web' ? 'mobile' : 'web')
  }

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const setDevicePreset = (preset: DevicePreset) => {
    setDevicePresetState(preset)
    localStorage.setItem('atlas_device_preset', preset)
  }

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        devicePreset,
        setDevicePreset,
        zoomScale,
        setZoomScale,
        isMobileDevice,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}
