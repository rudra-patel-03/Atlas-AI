import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { inspectRequest } from '@/lib/security/waf'

// Protected route prefixes requiring authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/chat',
  '/tools',
  '/agents',
  '/projects',
  '/files',
  '/settings',
  '/admin',
  '/history',
  '/community',
]

// Auth routes where already-logged-in users should be redirected to /dashboard
const AUTH_ROUTES = ['/auth/login', '/auth/signup']

interface MinimalSession {
  userId: string
  role: 'user' | 'admin'
  expiresAt: number
}

const SECRET = process.env.JWT_SECRET || 'atlas_ai_default_secret_key_32_chars'

async function verifySessionToken(token: string): Promise<MinimalSession | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [encoded, signature] = parts
    if (!encoded || !signature) return null

    // Cryptographic HMAC-SHA256 signature verification via Web Crypto API (Edge & Node compatible)
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Convert base64url signature to binary Uint8Array
    let b64 = signature.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4 !== 0) b64 += '='
    const binarySig = atob(b64)
    const sigBytes = new Uint8Array(binarySig.length)
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i)
    }

    const dataBytes = enc.encode(encoded)
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes)
    if (!isValid) return null

    // Base64Url decode payload
    let b64Payload = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (b64Payload.length % 4 !== 0) b64Payload += '='
    const payload = JSON.parse(atob(b64Payload)) as MinimalSession

    if (!payload.userId || !payload.expiresAt) return null
    if (Date.now() > payload.expiresAt) return null

    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Helper to maintain HTTPS scheme across Cloudflare tunnels and reverse proxies
  const getAbsoluteUrl = (targetPath: string) => {
    const host =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      request.nextUrl.host
    const isPublicTunnel =
      host.includes('.lhr.life') ||
      host.includes('.loca.lt') ||
      host.includes('.trycloudflare.com') ||
      host.includes('.vercel.app')
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (isPublicTunnel || request.url.startsWith('https') ? 'https' : 'http')
    return new URL(targetPath, `${proto}://${host}`)
  }

  // 1. 🛡️ WAF & Intrusion Detection: Block SQLi, XSS, Path Traversal, Scanners, and Sensitive File Probing
  const userAgent = request.headers.get('user-agent') || ''
  const threat = inspectRequest(pathname, request.nextUrl.searchParams, userAgent)
  if (threat.blocked) {
    const isProbe =
      threat.attackType === 'SENSITIVE_FILE_PROBE' || threat.attackType === 'SCANNER_PROBE'
    return new NextResponse(
      JSON.stringify({
        error: 'Access Denied: Security Violation Intercepted by ATLAS AI Defense Shield',
        attackType: threat.attackType,
        reason: threat.reason,
      }),
      {
        status: isProbe ? 403 : 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    )
  }

  // 2. ALWAYS allow Next.js internals, static assets, and media files without interference
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('atlas_session_token')?.value
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null

  // 3. New user landing: Root '/' immediately opens the Dashboard
  if (pathname === '/') {
    return NextResponse.redirect(getAbsoluteUrl('/dashboard'))
  }

  // 4. Compulsory Protection:
  // - Dashboard is publicly viewable for visitors to explore tools & agents
  // - Clicking into Chat, AI Tools, Agents, Projects, Files, or Settings COMPULSORILY requires login!
  const isPublicRoute =
    pathname === '/dashboard' ||
    pathname === '/help' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/models'

  if (!isPublicRoute) {
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required to access ATLAS AI services' },
          { status: 401 }
        )
      }
      const loginUrl = getAbsoluteUrl('/auth/login')
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based access control for /admin and /api/admin
    if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin')) {
      if (session.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Forbidden: Administrator privileges required' },
            { status: 403 }
          )
        }
        const dashboardUrl = getAbsoluteUrl('/dashboard')
        dashboardUrl.searchParams.set('denied', 'admin_privileges_required')
        return NextResponse.redirect(dashboardUrl)
      }
    }
  }

  // 6. Attach maximum enterprise security headers to response
  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(), payment=(), usb=(), display-capture=()'
  )
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  // Content Security Policy - Defends against unauthorized data transfer & script injections
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://devtoolbox-api.devtoolbox-api.workers.dev https://text.pollinations.ai https://api.duckduckgo.com https://en.wikipedia.org https://generativelanguage.googleapis.com https://api.openai.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, assets, uploads
     * - public files (images, logos, etc.)
     */
    '/((?!_next/static|_next/image|assets|uploads|favicon.ico).*)',
  ],
}
