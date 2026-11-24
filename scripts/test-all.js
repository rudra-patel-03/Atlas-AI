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

async function runTests() {
  console.log('=====================================================')
  console.log('       ATLAS AI COMPREHENSIVE PRODUCTION TEST        ')
  console.log('=====================================================\n')

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

  // TEST 1: Unauthenticated Root Redirect
  console.log('\n--- 1. Testing Compulsory Authentication & Root Redirect ---')
  const rootRes = await request('/')
  assert('Root / redirects unauthenticated users', rootRes.statusCode === 307 && rootRes.headers.location === '/auth/login', `Status: ${rootRes.statusCode}, Location: ${rootRes.headers.location}`)

  const unauthDash = await request('/dashboard')
  assert('Protected /dashboard rejects unauthenticated access', unauthDash.statusCode === 307 && unauthDash.headers.location.includes('/auth/login'), `Status: ${unauthDash.statusCode}`)

  // TEST 2: Authentication APIs
  console.log('\n--- 2. Testing Authentication APIs ---')
  
  // 2a. Login as Atlas Reed
  const loginRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'login', username: 'atlasreed', password: 'Atlas@12345' },
  })
  let loginData = {}
  try { loginData = JSON.parse(loginRes.body) } catch {}
  assert('Login with @atlasreed succeeds', loginRes.statusCode === 200 && loginData.success, `Body: ${loginRes.body}`)
  
  const cookieHeader = loginRes.headers['set-cookie']
  const sessionCookie = cookieHeader ? cookieHeader[0].split(';')[0] : ''
  assert('Session cookie (atlas_session_token) generated', sessionCookie.includes('atlas_session_token='))

  // 2b. Login as Admin
  const adminLoginRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'login', username: 'admin', password: 'Admin@12345' },
  })
  let adminData = {}
  try { adminData = JSON.parse(adminLoginRes.body) } catch {}
  assert('Admin login succeeds with admin role', adminLoginRes.statusCode === 200 && adminData.user?.role === 'admin')
  const adminCookie = adminLoginRes.headers['set-cookie'] ? adminLoginRes.headers['set-cookie'][0].split(';')[0] : ''

  // 2c. Google Auth (Account Selection Handshake)
  const googleRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'google-auth',
      googleName: 'Atlas Reed',
      googleEmail: 'atlasreed@gmail.com',
    },
  })
  let googleData = {}
  try { googleData = JSON.parse(googleRes.body) } catch {}
  assert('Google Sign-In with selected account succeeds', googleRes.statusCode === 200 && googleData.success)

  // 2d. Forgot Password OTP
  const fpRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'forgot-password', identifier: 'atlasreed' },
  })
  let fpData = {}
  try { fpData = JSON.parse(fpRes.body) } catch {}
  assert('Forgot password OTP generation succeeds', fpRes.statusCode === 200 && !!fpData.mockOtp, `OTP: ${fpData.mockOtp}`)

  // 2e. Reset Password with OTP
  const rpRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'reset-password', identifier: 'atlasreed', otp: fpData.mockOtp || '123456', newPassword: 'Atlas@12345' },
  })
  let rpData = {}
  try { rpData = JSON.parse(rpRes.body) } catch {}
  assert('Reset password with verification OTP succeeds', rpRes.statusCode === 200 && rpData.success)

  // TEST 3: Public Auth Pages
  console.log('\n--- 3. Testing Public Authentication Pages ---')
  const authPages = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password']
  for (const page of authPages) {
    const res = await request(page)
    assert(`Page ${page} responds HTTP 200 OK`, res.statusCode === 200, `Status: ${res.statusCode}`)
  }

  // TEST 4: Protected Workspace Routes (Using Session Cookie)
  console.log('\n--- 4. Testing Protected Workspace Routes (Authenticated) ---')
  const authHeaders = { Cookie: sessionCookie }
  const protectedRoutes = [
    '/dashboard',
    '/chat',
    '/tools',
    '/tools/code',
    '/tools/image',
    '/tools/video',
    '/tools/voice',
    '/tools/voice-chat',
    '/tools/prompt',
    '/tools/pdf',
    '/tools/doc-assistant',
    '/tools/summarizer',
    '/tools/notes',
    '/tools/translator',
    '/tools/research',
    '/agents',
    '/projects',
    '/files',
    '/history',
    '/settings',
    '/help',
    '/community',
  ]

  for (const route of protectedRoutes) {
    const res = await request(route, { headers: authHeaders })
    assert(`Route ${route} accessible with session (HTTP 200)`, res.statusCode === 200, `Status: ${res.statusCode}`)
  }

  // Admin route with admin session
  const adminRouteRes = await request('/admin', { headers: { Cookie: adminCookie } })
  assert('Route /admin accessible with admin privileges (HTTP 200)', adminRouteRes.statusCode === 200, `Status: ${adminRouteRes.statusCode}`)

  // TEST 5: Backend AI Tools and Functional APIs
  console.log('\n--- 5. Testing Functional Backend APIs ---')

  // 5a. Models API
  const modelsRes = await request('/api/models', { headers: authHeaders })
  let modelsData = {}
  try { modelsData = JSON.parse(modelsRes.body) } catch {}
  assert('API /api/models returns configured models', modelsRes.statusCode === 200 && Array.isArray(modelsData.models) && modelsData.models.length > 0)

  // 5b. Code Generator API
  const codeRes = await request('/api/tools/code', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { prompt: 'Create a binary search function', language: 'typescript', action: 'generate' },
  })
  let codeData = {}
  try { codeData = JSON.parse(codeRes.body) } catch {}
  assert('API /api/tools/code generates code response', codeRes.statusCode === 200 && (!!codeData.result || !!codeData.code))

  // 5c. Image Generator API
  const imgRes = await request('/api/tools/image', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { prompt: 'Futuristic AI neon cityscape with cyber towers', style: 'cyberpunk', aspectRatio: '16:9' },
  })
  let imgData = {}
  try { imgData = JSON.parse(imgRes.body) } catch {}
  assert('API /api/tools/image generates image result', imgRes.statusCode === 200 && (!!imgData.imageUrl || !!imgData.url || !!imgData.images))

  // 5d. Video Generator API
  const videoRes = await request('/api/tools/video', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { prompt: 'Drone shot of orbiting space station around Earth', duration: '5s' },
  })
  assert('API /api/tools/video responds', videoRes.statusCode === 200)

  // 5e. Voice / TTS API
  const voiceRes = await request('/api/tools/voice', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { text: 'Welcome to ATLAS AI platform', voice: 'nova' },
  })
  assert('API /api/tools/voice responds', voiceRes.statusCode === 200)

  // 5f. Prompt Generator API
  const promptRes = await request('/api/tools/prompt', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { topic: 'Autonomous Agent Design', category: 'coding' },
  })
  assert('API /api/tools/prompt generates prompts', promptRes.statusCode === 200)

  // 5g. Summarizer API
  const sumRes = await request('/api/tools/summarize', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { text: 'Artificial Intelligence systems have evolved from rule-based engines to generative transformer networks capable of few-shot reasoning across complex domains.', mode: 'executive' },
  })
  assert('API /api/tools/summarize generates summary', sumRes.statusCode === 200)

  // 5h. Notes Generator API
  const notesRes = await request('/api/tools/notes', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { topic: 'Quantum Cryptography and Post-Quantum Algorithms' },
  })
  assert('API /api/tools/notes generates study notes', notesRes.statusCode === 200)

  // 5i. Translator API
  const transRes = await request('/api/tools/translate', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { text: 'Hello, welcome to ATLAS AI', sourceLang: 'en', targetLang: 'es' },
  })
  assert('API /api/tools/translate translates text', transRes.statusCode === 200)

  // 5j. Deep Research API
  const resRes = await request('/api/tools/research', {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: { query: 'Next-generation solid-state battery technology 2026' },
  })
  assert('API /api/tools/research performs research', resRes.statusCode === 200)

  // 5k. AI Agents API
  const agentsRes = await request('/api/agents', { headers: authHeaders })
  let agentsData = {}
  try { agentsData = JSON.parse(agentsRes.body) } catch {}
  assert('API /api/agents returns autonomous agents list', agentsRes.statusCode === 200 && Array.isArray(agentsData.agents || agentsData))

  // 5l. Projects API
  const projRes = await request('/api/projects', { headers: authHeaders })
  assert('API /api/projects lists projects', projRes.statusCode === 200)

  // 5m. Files API
  const filesRes = await request('/api/files', { headers: authHeaders })
  assert('API /api/files lists file records', filesRes.statusCode === 200)

  // 5n. Chats API
  const chatsRes = await request('/api/chats', { headers: authHeaders })
  assert('API /api/chats lists conversations', chatsRes.statusCode === 200)

  // 5o. Admin Telemetry API
  const adminApiRes = await request('/api/admin', { headers: { Cookie: adminCookie } })
  assert('API /api/admin returns telemetry data for admin', adminApiRes.statusCode === 200)

  console.log('\n=====================================================')
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: \x1b[32m${passed}\x1b[0m | FAILED: \x1b[31m${failed}\x1b[0m`)
  console.log('=====================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
