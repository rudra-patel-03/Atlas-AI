const http = require('http')

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001'

async function request(urlPath, options = {}) {
  const url = new URL(urlPath, BASE)
  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      res => {
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          })
        })
      }
    )
    req.on('error', reject)
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
    }
    req.end()
  })
}

async function runSecuritySuite() {
  console.log('=================================================================')
  console.log('       ATLAS AI ENTERPRISE SECURITY & THREAT DEFENSE TEST        ')
  console.log('=================================================================\n')

  let passed = 0
  let failed = 0

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  \x1b[32m✔ PASS\x1b[0m: ${name}`)
      passed++
    } else {
      console.log(`  \x1b[31m✖ FAIL\x1b[0m: ${name} ${details ? `(${details})` : ''}`)
      failed++
    }
  }

  // --- LAYER 1: WAF & INTRUSION DETECTION ---
  console.log('--- 1. Testing WAF Intrusion Detection & Attack Neutralization ---')

  // 1a. SQL Injection attempt in query
  const sqliRes = await request('/chat?q=%27%20UNION%20SELECT%201,2,3--')
  assert(
    'WAF intercepts and blocks SQL Injection payload',
    sqliRes.statusCode === 400 && sqliRes.body.includes('SQL_INJECTION'),
    `Status: ${sqliRes.statusCode}, Body: ${sqliRes.body}`
  )

  // 1b. XSS Injection attempt in query
  const xssRes = await request('/chat?search=%3Cscript%3Ealert(1)%3C/script%3E')
  assert(
    'WAF intercepts and blocks Cross-Site Scripting (XSS) payload',
    xssRes.statusCode === 400 && xssRes.body.includes('XSS'),
    `Status: ${xssRes.statusCode}`
  )

  // 1c. Sensitive File Probing (.env)
  const envRes = await request('/.env')
  assert(
    'WAF blocks unauthorized .env configuration probe with 403',
    envRes.statusCode === 403,
    `Status: ${envRes.statusCode}`
  )

  // 1d. Sensitive Git Directory Probing (.git/config)
  const gitRes = await request('/.git/config')
  assert(
    'WAF blocks unauthorized .git repository probe with 403',
    gitRes.statusCode === 403,
    `Status: ${gitRes.statusCode}`
  )

  // 1e. Malicious Scanner User-Agent (sqlmap)
  const scannerRes = await request('/', {
    headers: { 'User-Agent': 'sqlmap/1.6.11#stable (https://sqlmap.org)' },
  })
  assert(
    'WAF blocks automated vulnerability scanner (sqlmap) with 403',
    scannerRes.statusCode === 403,
    `Status: ${scannerRes.statusCode}`
  )

  // --- LAYER 2: ZERO-TRUST ACCESS CONTROL & MULTI-TENANT ISOLATION ---
  console.log('\n--- 2. Testing Zero-Trust Access Control & Data Isolation ---')

  // 2a. Unauthenticated page access is blocked and redirected
  const unauthDash = await request('/dashboard')
  assert(
    'Unauthenticated user redirected from /dashboard with 307',
    unauthDash.statusCode === 307 && unauthDash.headers.location.includes('/auth/login'),
    `Status: ${unauthDash.statusCode}`
  )

  // 2b. Unauthenticated API access is rejected with 401
  const unauthTool = await request('/api/tools/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { prompt: 'quicksort' },
  })
  assert(
    'Unauthenticated API call rejected with 401 Unauthorized',
    unauthTool.statusCode === 401,
    `Status: ${unauthTool.statusCode}`
  )

  // 2c. Login as Atlas Reed
  const loginRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'login', username: 'atlasreed', password: 'Atlas@12345' },
  })
  const userCookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : ''
  assert('Authentication establishes valid secure session', loginRes.statusCode === 200 && userCookie.includes('atlas_session_token'))

  // 2d. Non-admin user blocked from /admin
  const nonAdminAdmin = await request('/admin', {
    headers: { 'Cookie': userCookie },
  })
  assert(
    'Non-admin user blocked from /admin route',
    nonAdminAdmin.statusCode === 307 && nonAdminAdmin.headers.location.includes('admin_privileges_required'),
    `Status: ${nonAdminAdmin.statusCode}, Location: ${nonAdminAdmin.headers.location}`
  )

  // 2e. Non-admin user blocked from /api/admin
  const nonAdminApi = await request('/api/admin', {
    headers: { 'Cookie': userCookie },
  })
  assert(
    'Non-admin user blocked from /api/admin with 403 Forbidden',
    nonAdminApi.statusCode === 403,
    `Status: ${nonAdminApi.statusCode}`
  )

  // --- LAYER 3: ANTI-DATA EXFILTRATION & SECURITY HEADERS ---
  console.log('\n--- 3. Testing Anti-Data-Exfiltration & Enterprise Headers ---')

  const headersRes = await request('/auth/login')
  const headers = headersRes.headers

  assert('HSTS (Strict-Transport-Security) header enforced', !!headers['strict-transport-security'], headers['strict-transport-security'])
  assert('Anti-Clickjacking (X-Frame-Options: DENY) enforced', headers['x-frame-options'] === 'DENY', headers['x-frame-options'])
  assert('MIME Sniffing Blocker (X-Content-Type-Options: nosniff) enforced', headers['x-content-type-options'] === 'nosniff', headers['x-content-type-options'])
  assert('XSS Protection (X-XSS-Protection: 1; mode=block) enforced', headers['x-xss-protection'] === '1; mode=block', headers['x-xss-protection'])
  assert('Referrer-Policy enforced', headers['referrer-policy'] === 'strict-origin-when-cross-origin', headers['referrer-policy'])
  assert('Content-Security-Policy (CSP) restricts frame-ancestors', headers['content-security-policy']?.includes("frame-ancestors 'none'"), headers['content-security-policy'])
  assert('Content-Security-Policy (CSP) restricts object-src', headers['content-security-policy']?.includes("object-src 'none'"), headers['content-security-policy'])
  assert('Content-Security-Policy (CSP) restricts form-action', headers['content-security-policy']?.includes("form-action 'self'"), headers['content-security-policy'])
  assert('Technology Fingerprint (X-Powered-By) is completely removed', !headers['x-powered-by'])

  // --- LAYER 4: DATA PRIVACY & AUDIT LOGGING ---
  console.log('\n--- 4. Testing Data Privacy & Security Audit Logging ---')

  // 4a. Verify Settings API never leaks passwordHash
  const settingsRes = await request('/api/settings', {
    headers: { 'Cookie': userCookie },
  })
  let settingsData = {}
  try { settingsData = JSON.parse(settingsRes.body) } catch {}
  assert('Settings API does NOT expose user passwordHash', settingsData.user && settingsData.user.passwordHash === undefined)

  // 4b. Verify Auth Status API never leaks passwordHash
  const authGetRes = await request('/api/auth', {
    headers: { 'Cookie': userCookie },
  })
  let authGetData = {}
  try { authGetData = JSON.parse(authGetRes.body) } catch {}
  assert('Auth GET API does NOT expose user passwordHash', authGetData.user && authGetData.user.passwordHash === undefined)
  assert('Security stats reporting active defense modules', authGetData.security && authGetData.security.wafStatus === 'ACTIVE_ARMORED')

  // 4c. Verify Session Revocation (Emergency Lockout)
  const revokeRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Cookie': userCookie, 'Content-Type': 'application/json' },
    body: { action: 'revoke-sessions' },
  })
  let revokeData = {}
  try { revokeData = JSON.parse(revokeRes.body) } catch {}
  assert('Emergency Session Revocation succeeds', revokeRes.statusCode === 200 && revokeData.success)

  console.log('\n=================================================================')
  console.log(`TOTAL SECURITY TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`)
  console.log('=================================================================\n')

  if (failed === 0) {
    console.log('🛡️ ENTERPRISE DEFENSE SHIELD: 100% VERIFIED & BULLETPROOF!')
    process.exit(0)
  } else {
    process.exit(1)
  }
}

runSecuritySuite().catch(err => {
  console.error('Fatal error during security test:', err)
  process.exit(1)
})
