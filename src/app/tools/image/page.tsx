'use client'

import React, { useState } from 'react'
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Maximize2,
  RefreshCw,
  Sliders,
  History,
  X,
  Share2,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  aspectRatio: string
  createdAt: string
}

export default function ImageGeneratorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [style, setStyle] = useState('cyberpunk')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [loading, setLoading] = useState(false)
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null)
  const [history, setHistory] = useState<GeneratedImage[]>([
    {
      id: 'img-seed-1',
      url: '/assets/logo.jpg',
      prompt: 'ATLAS AI Official Insignia - Electric blue triangular glyph with cyan orbital rings and futuristic cyber circuit traces',
      style: 'cyberpunk',
      aspectRatio: '1:1',
      createdAt: new Date().toISOString(),
    },
  ])
  const [previewModal, setPreviewModal] = useState<GeneratedImage | null>(null)

  const styles = [
    { id: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'Electric blue and cyan tech glow with 8k render' },
    { id: 'photorealistic', label: 'Photorealistic', desc: 'Ultra-detailed 8K photography and studio lighting' },
    { id: 'anime', label: 'Anime Studio', desc: 'Vibrant Makoto Shinkai artistic aesthetic' },
    { id: '3d-render', label: '3D Octane Render', desc: 'Stylized 3D geometry and glass textures' },
    { id: 'cinematic', label: 'Cinematic Film', desc: '35mm anamorphic photography and moody tones' },
    { id: 'minimalist', label: 'Minimalist Vector', desc: 'Clean vector graphic design and high contrast' },
  ]

  const aspectRatios = [
    { id: '1:1', label: 'Square (1:1)', dims: '1024x1024' },
    { id: '16:9', label: 'Landscape (16:9)', dims: '1280x720' },
    { id: '9:16', label: 'Portrait (9:16)', dims: '720x1280' },
    { id: '4:3', label: 'Standard (4:3)', dims: '1024x768' },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/tools/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          style,
          aspectRatio,
        }),
      })

      const data = await res.json()
      if (data.imageUrl) {
        const newImg: GeneratedImage = {
          id: 'img-' + Date.now(),
          url: data.imageUrl,
          prompt,
          style,
          aspectRatio,
          createdAt: new Date().toISOString(),
        }
        setCurrentImage(newImg)
        setHistory(prev => [newImg, ...prev])
      } else if (data.error) {
        alert(`Image Generation Notice: ${data.error}`)
      }
    } catch (e) {
      console.error('Image generation failed', e)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = (url: string, name: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/\s+/g, '_').slice(0, 30)}.png`
    a.target = '_blank'
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
              <ImageIcon className="w-6 h-6 text-cyan-400" />
              <span>Atlas Neural Image Studio</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              High-resolution text-to-image synthesis with style conditioning and real-time generation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-atlas-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Image Prompt
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. A futuristic cyber orbital station overlooking a deep blue planet with electric blue rings and nebula glow, 8k resolution..."
                  className="w-full p-3 rounded-xl bg-atlas-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Negative Prompt (What to exclude)
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={e => setNegativePrompt(e.target.value)}
                  placeholder="e.g. blur, low quality, distorted, extra limbs"
                  className="w-full p-2.5 rounded-xl bg-atlas-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Style Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Artistic Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {styles.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        style === s.id
                          ? 'bg-blue-600/25 border-cyan-500 text-white shadow-neon-sm'
                          : 'bg-atlas-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-atlas-900'
                      }`}
                    >
                      <span className="font-bold text-xs block text-slate-100">{s.label}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {aspectRatios.map(ar => (
                    <button
                      key={ar.id}
                      onClick={() => setAspectRatio(ar.id)}
                      className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                        aspectRatio === ar.id
                          ? 'bg-blue-600 text-white border-blue-400 shadow-neon-sm'
                          : 'bg-atlas-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>{ar.label}</div>
                      <div className="text-[10px] opacity-60 font-mono">{ar.dims}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 shadow-neon-sm hover:shadow-neon-blue transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering Latent Diffusion...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Artwork</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Canvas Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Preview Frame */}
              <div className="p-4 rounded-2xl bg-atlas-900/80 border border-slate-800 min-h-[460px] flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-white font-mono uppercase tracking-wider">
                    Interactive Render Canvas
                  </span>
                  {currentImage && (
                    <span className="text-[11px] text-cyan-400 font-mono">
                      Style: {currentImage.style} | Ratio: {currentImage.aspectRatio}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center py-4">
                  {loading ? (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs text-cyan-300 font-mono">
                        Denoising latent space with neural weights...
                      </p>
                    </div>
                  ) : currentImage ? (
                    <div className="relative group max-w-full rounded-xl overflow-hidden border border-cyan-500/30 shadow-neon-sm">
                      <img
                        src={currentImage.url}
                        alt={currentImage.prompt}
                        className="max-h-[380px] w-auto object-contain rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => setPreviewModal(currentImage)}
                          className="p-3 rounded-full bg-atlas-900/80 hover:bg-blue-600 text-white transition-colors"
                          title="View Fullscreen"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => downloadImage(currentImage.url, currentImage.prompt)}
                          className="p-3 rounded-full bg-atlas-900/80 hover:bg-cyan-500 text-white transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 text-xs space-y-2">
                      <ImageIcon className="w-12 h-12 text-slate-700 mx-auto" />
                      <p>Enter a prompt and choose a style to synthesize artwork.</p>
                    </div>
                  )}
                </div>

                {currentImage && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <p className="truncate max-w-md font-sans italic">"{currentImage.prompt}"</p>
                    <button
                      onClick={() => downloadImage(currentImage.url, currentImage.prompt)}
                      className="px-3 py-1 rounded-lg bg-blue-600/30 border border-blue-500/50 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Generation History Gallery */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Session Gallery ({history.length})</span>
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {history.map(img => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImage(img)}
                      className="relative rounded-xl overflow-hidden aspect-square border border-slate-800 hover:border-cyan-400 group transition-all"
                    >
                      <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fullscreen Modal */}
          {previewModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
              onClick={() => setPreviewModal(null)}
            >
              <div className="relative max-w-4xl w-full p-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-atlas-900 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={previewModal.url}
                  alt={previewModal.prompt}
                  className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-cyan-500/40"
                />
                <div className="mt-3 p-3 rounded-xl bg-atlas-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 italic">{previewModal.prompt}</span>
                  <button
                    onClick={() => downloadImage(previewModal.url, previewModal.prompt)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download High-Res</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
