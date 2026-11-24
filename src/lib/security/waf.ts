/**
 * ATLAS AI - Web Application Firewall (WAF) & Intrusion Detection System
 * Inspects requests for SQL Injection, XSS, Path Traversal, Command Injection,
 * Prototype Pollution, and Malicious Vulnerability Scanners.
 */

export interface ThreatInspectionResult {
  blocked: boolean
  attackType?: 'SQL_INJECTION' | 'XSS' | 'PATH_TRAVERSAL' | 'COMMAND_INJECTION' | 'PROTOTYPE_POLLUTION' | 'SCANNER_PROBE' | 'SENSITIVE_FILE_PROBE'
  patternMatched?: string
  reason?: string
}

// Known vulnerability scanners and attack automation user-agents
const SCANNER_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /acunetix/i,
  /burpcollaborator/i,
  /hydra/i,
  /nmap/i,
  /gobuster/i,
  /dirbuster/i,
  /wpscan/i,
  /masscan/i,
  /zgrab/i,
  /havij/i,
]

// Sensitive system files and probing paths that should NEVER be accessed
const FORBIDDEN_PATHS = [
  /\/\.env(\.|$)/i,
  /\/\.git(\/|$)/i,
  /\/\.aws(\/|$)/i,
  /\/\.ssh(\/|$)/i,
  /\/\.htaccess/i,
  /\/\.htpasswd/i,
  /\/wp-admin(\/|$)/i,
  /\/wp-login\.php/i,
  /\/phpmyadmin/i,
  /\/cgi-bin\//i,
  /\/admin\.php/i,
  /\/web\.config/i,
  /\/config\.json$/i,
]

// SQL Injection attack signatures
const SQLI_PATTERNS = [
  /(\bunion\b\s+(all\s+)?\bselect\b)/i,
  /((\%27)|('))\s*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // ' or
  /(\b(select|insert|update|delete|drop|alter|truncate)\b\s+.*\b(from|into|table|database)\b)/i,
  /(;\s*--)/i,
  /(\bexec(\s|\+)+(s|x)p\w+)/i,
  /(\bwaitfor\b\s+\bdelay\b)/i,
  /(\bbenchmark\b\s*\(\s*\d+\s*,\s*\w+\s*\))/i,
  /('|\%27)\s*--/i,
  /('|\%27)\s*;/i,
]

// Cross-Site Scripting (XSS) signatures
const XSS_PATTERNS = [
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript:\s*/i,
  /vbscript:\s*/i,
  /data:text\/html/i,
  /on(error|load|click|mouseover|focus|blur|change|submit)\s*=/i,
  /<iframe\b[^>]*>/i,
  /<embed\b[^>]*>/i,
  /<object\b[^>]*>/i,
  /<svg\b[^>]*\bonload\s*=/i,
  /<img\b[^>]*\bonerror\s*=/i,
  /document\.cookie/i,
  /document\.location/i,
  /window\.location/i,
  /\beval\s*\(/i,
]

// Path / Directory Traversal signatures
const TRAVERSAL_PATTERNS = [
  /(\.\.[\/\\])/,
  /(\%2e\%2e[\/\\])/i,
  /(\.\.%2f)/i,
  /(\.\.%5c)/i,
  /\/etc\/(passwd|shadow|group|hosts)/i,
  /[a-zA-Z]:\\(windows|winnt|system32)/i,
  /boot\.ini/i,
  /win\.ini/i,
]

// Remote / OS Command Injection signatures
const CMD_PATTERNS = [
  /(;|\&|\|)\s*(cat|ls|rm|chmod|chown|kill|wget|curl|nc|bash|sh|powershell|cmd\.exe)\s+/i,
  /`[^`]*(cat|ls|rm|wget|curl|bash)[^`]*`/i,
  /\$\([^)]*(cat|ls|rm|wget|curl|bash)[^)]*\)/i,
]

// Prototype Pollution signatures
const PROTOTYPE_PATTERNS = [
  /__proto__/i,
  /constructor\[['"]?prototype['"]?\]/i,
  /prototype\[['"]?\w+['"]?\]/i,
]

/**
 * Inspect an incoming request for threat vectors
 */
export function inspectRequest(
  pathname: string,
  searchParams?: URLSearchParams,
  userAgent?: string
): ThreatInspectionResult {
  // 1. Check for Scanner User-Agents
  if (userAgent) {
    for (const pattern of SCANNER_USER_AGENTS) {
      if (pattern.test(userAgent)) {
        return {
          blocked: true,
          attackType: 'SCANNER_PROBE',
          patternMatched: userAgent.slice(0, 50),
          reason: 'Automated vulnerability scanner signature detected.',
        }
      }
    }
  }

  // 2. Check for Forbidden Sensitive File Probing
  for (const pattern of FORBIDDEN_PATHS) {
    if (pattern.test(pathname)) {
      return {
        blocked: true,
        attackType: 'SENSITIVE_FILE_PROBE',
        patternMatched: pathname,
        reason: 'Attempted access to sensitive configuration or system path.',
      }
    }
  }

  // 3. Check for Path Traversal in URL Path
  for (const pattern of TRAVERSAL_PATTERNS) {
    if (pattern.test(pathname)) {
      return {
        blocked: true,
        attackType: 'PATH_TRAVERSAL',
        patternMatched: pathname,
        reason: 'Directory traversal attack sequence detected in URL path.',
      }
    }
  }

  // 4. Check Query Parameters for Injections
  if (searchParams) {
    for (const [key, val] of searchParams.entries()) {
      const combined = `${key}=${val}`

      // Check SQLi
      for (const pattern of SQLI_PATTERNS) {
        if (pattern.test(combined)) {
          return {
            blocked: true,
            attackType: 'SQL_INJECTION',
            patternMatched: combined.slice(0, 50),
            reason: 'SQL injection sequence detected in query parameter.',
          }
        }
      }

      // Check XSS
      for (const pattern of XSS_PATTERNS) {
        if (pattern.test(combined)) {
          return {
            blocked: true,
            attackType: 'XSS',
            patternMatched: combined.slice(0, 50),
            reason: 'Cross-site scripting (XSS) sequence detected in query parameter.',
          }
        }
      }

      // Check Traversal
      for (const pattern of TRAVERSAL_PATTERNS) {
        if (pattern.test(combined)) {
          return {
            blocked: true,
            attackType: 'PATH_TRAVERSAL',
            patternMatched: combined.slice(0, 50),
            reason: 'Directory traversal pattern detected in query parameter.',
          }
        }
      }

      // Check Prototype Pollution
      for (const pattern of PROTOTYPE_PATTERNS) {
        if (pattern.test(combined)) {
          return {
            blocked: true,
            attackType: 'PROTOTYPE_POLLUTION',
            patternMatched: combined.slice(0, 50),
            reason: 'Prototype pollution vector detected.',
          }
        }
      }
    }
  }

  return { blocked: false }
}

/**
 * Deep sanitizer for untrusted objects to prevent prototype pollution and injection
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeObject) as unknown as T
  }

  const cleanObj: Record<string, any> = {}
  for (const [key, value] of Object.entries(input)) {
    // Strip prototype pollution keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }
    cleanObj[key] = sanitizeObject(value)
  }

  return cleanObj as T
}

/**
 * AI Input Guard to neutralize prompt injection, jailbreaks, and secret extraction
 */
export function sanitizeAIInput(text: string): string {
  if (!text || typeof text !== 'string') return ''

  return text
    .replace(/ignore\s+(all\s+)?(previous|prior|above)\s+instructions/gi, '[neutralized directive]')
    .replace(/disregard\s+(all\s+)?(previous|prior|system)\s+rules/gi, '[neutralized directive]')
    .replace(/you\s+are\s+now\s+in\s+(developer|god|dan|jailbreak)\s+mode/gi, '[neutralized directive]')
    .replace(/reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions|secret\s+key|api\s+key)/gi, '[neutralized directive]')
    .replace(/print\s+(all\s+)?(environment\s+variables|env\s+vars|process\.env)/gi, '[neutralized directive]')
    .replace(/dump\s+(all\s+)?(users|passwords|database|hashes)/gi, '[neutralized directive]')
    .trim()
}

/**
 * Data Loss Prevention (DLP) & Anti-Exfiltration Engine
 * Automatically scrubs API keys, cryptographic tokens, passwords, 
 * database secrets, and host filesystem paths from outgoing responses.
 */
export function scrubExfiltration(text: string): { scrubbed: string; redactedCount: number } {
  if (!text || typeof text !== 'string') return { scrubbed: text || '', redactedCount: 0 }

  let count = 0
  let result = text

  // 1. Google Gemini API keys
  result = result.replace(/AIzaSy[A-Za-z0-9_-]{30,40}/g, () => {
    count++
    return '[PROTECTED_API_KEY_REDACTED]'
  })

  // 2. OpenAI API keys
  result = result.replace(/sk-(?:proj-)?[A-Za-z0-9_-]{32,}/g, () => {
    count++
    return '[PROTECTED_API_KEY_REDACTED]'
  })

  // 3. GitHub & General Service Tokens
  result = result.replace(/gh[pousr]_[A-Za-z0-9_]{36,}/g, () => {
    count++
    return '[PROTECTED_TOKEN_REDACTED]'
  })

  // 4. JWT Session Tokens
  result = result.replace(/ey[A-Za-z0-9_-]{15,}\.ey[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/g, () => {
    count++
    return '[SESSION_TOKEN_REDACTED]'
  })

  // 5. Hardcoded Salts, Master Keys & Secrets
  const KNOWN_SECRETS = [
    /atlas_ai_salt_2026/gi,
    /atlas-admin-2026/gi,
    /atlas_ai_default_secret_key_32_chars/gi,
    /atlas_ai_security_pepper_2026/gi,
  ]
  for (const secret of KNOWN_SECRETS) {
    if (secret.test(result)) {
      count++
      result = result.replace(secret, '[REDACTED_SECURITY_SECRET]')
    }
  }

  // 6. Host System User Paths
  result = result.replace(/[A-Za-z]:\\Users\\[^\s"'\\]+/gi, 'C:\\Users\\***')

  return { scrubbed: result, redactedCount: count }
}

/**
 * Convenience helper that returns the scrubbed string directly.
 */
export function scrubText(text: string): string {
  return scrubExfiltration(text).scrubbed
}
