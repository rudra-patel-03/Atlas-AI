import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  linkTo?: string
  className?: string
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  linkTo = '/',
  className = '',
}) => {
  const dimensions = {
    sm: { img: 28, text: 'text-lg', tag: 'text-[9px]' },
    md: { img: 36, text: 'text-xl', tag: 'text-[10px]' },
    lg: { img: 48, text: 'text-2xl', tag: 'text-xs' },
  }[size]

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative group flex items-center justify-center">
        {/* Ambient glow behind logo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-600 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition duration-300 animate-pulse-slow" />
        <div className="relative rounded-full overflow-hidden border border-cyan-500/30 bg-black/60 p-0.5 shadow-neon-sm">
          <img
            src="/assets/logo.jpg"
            alt="ATLAS AI Logo"
            className="rounded-full object-cover"
            style={{ width: dimensions.img, height: dimensions.img }}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-400 ${dimensions.text}`}>
            ATLAS
          </span>
          <span className={`font-bold px-1.5 py-0.5 rounded text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm`}>
            AI
          </span>
        </div>
        {showTagline && (
          <span className={`tracking-widest uppercase font-semibold text-cyan-400/90 ${dimensions.tag}`}>
            Chat. Create. Code. Learn.
          </span>
        )}
      </div>
    </div>
  )

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>
  }

  return content
}
