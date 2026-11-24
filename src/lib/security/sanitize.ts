/**
 * ATLAS AI - Security Sanitization & Validation Utilities
 * Defends against XSS, Path Traversal, and Injection payloads.
 */

/**
 * Strips dangerous HTML tags, javascript: URI handlers, and inline event scripts (onload, onerror, etc.)
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''

  return input
    // Remove explicit script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers like onclick, onload, onerror
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove javascript: pseudo-protocols
    .replace(/javascript:[^"'\s]*/gi, '')
    // Remove dangerous iframe / embed / object tags
    .replace(/<\/?(iframe|embed|object|applet|meta|link)[^>]*>/gi, '')
    .trim()
}

/**
 * Sanitizes file names to completely prevent Directory Traversal attacks (e.g. `../../etc/passwd`).
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file'

  // Remove any path traversal tokens like ../ or ..\
  let clean = filename.replace(/\.\./g, '')

  // Remove non-standard or dangerous characters, keeping letters, numbers, hyphens, underscores, dots
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Prevent hidden files starting with dot
  clean = clean.replace(/^\.+/, '')

  // Ensure reasonable length
  if (clean.length > 100) {
    const ext = clean.includes('.') ? clean.slice(clean.lastIndexOf('.')) : ''
    clean = clean.slice(0, 95) + ext
  }

  return clean || 'document_' + Date.now()
}

/**
 * Validates password strength according to enterprise security standards.
 * Minimum 8 characters, requiring at least one letter and one number or symbol.
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, reason: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { valid: false, reason: 'Password cannot exceed 128 characters' }
  }

  const hasLetter = /[a-zA-Z]/.test(password)
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  if (!hasLetter || !hasDigitOrSpecial) {
    return {
      valid: false,
      reason: 'Password must include both letters and at least one number or special character',
    }
  }

  return { valid: true }
}

/**
 * Validates email format strictly.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email.trim())
}

/**
 * Validates username strictly (alphanumeric, underscore, dot, hyphen; 3-30 chars).
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false
  const clean = username.trim()
  return /^[a-zA-Z0-9_.-]{3,30}$/.test(clean)
}
