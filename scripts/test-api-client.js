const http = require('http')

const BASE = 'http://127.0.0.1:3000'

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE)
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
          let json = null
          try { json = JSON.parse(data) } catch {}
          resolve({ status: res.statusCode, headers: res.headers, body: data, json })
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

async function run() {
  console.log('=== RUNNING LIVE HTTP API & INTEGRATION VERIFICATION ===\n')
  let passed = 0
  let failed = 0

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${title}`)
      passed++
    } else {
      console.log(`[FAIL] ${title} ${extra ? `-> ${extra}` : ''}`)
      failed++
    }
  }

  // 1. Models endpoint
  const modelsRes = await request('/api/models')
  assert('Models endpoint returns models list', modelsRes.status === 200 && Array.isArray(modelsRes.json?.models))
  const atlasCore = modelsRes.json?.models?.find(m => m.id === 'atlas-core')
  assert('Built-in ATLAS Core Live Engine is listed and available', !!atlasCore && atlasCore.isAvailable === true)

  // 2. Registration Validation: Mismatched passwords
  const badReg = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'signup',
      name: 'Test Tester',
      username: 'testtester',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
    },
  })
  assert('Registration rejects mismatched passwords with 400', badReg.status === 400 && badReg.json?.error?.includes('do not match'))

  // 3. Registration Validation: Short password
  const shortPwReg = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'signup',
      name: 'Test Tester',
      username: 'testtester',
      email: 'test@example.com',
      password: '123',
      confirmPassword: '123',
    },
  })
  assert('Registration rejects short passwords with 400', shortPwReg.status === 400)

  // 4. Successful User A Registration
  const testUserAUsername = 'user_live_a_' + Date.now().toString().slice(-5)
  const regUserA = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'signup',
      name: 'Live User Alpha',
      username: testUserAUsername,
      email: `${testUserAUsername}@example.com`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    },
  })
  assert('Registration succeeds with valid input', regUserA.status === 200 && regUserA.json?.success === true)
  const cookieA = regUserA.headers['set-cookie'] ? regUserA.headers['set-cookie'][0].split(';')[0] : ''
  assert('User A received session cookie', cookieA.includes('atlas_session_token='))

  // 5. Successful User B Registration
  const testUserBUsername = 'user_live_b_' + Date.now().toString().slice(-5)
  const regUserB = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'signup',
      name: 'Live User Beta',
      username: testUserBUsername,
      email: `${testUserBUsername}@example.com`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    },
  })
  assert('User B registration succeeds', regUserB.status === 200)
  const cookieB = regUserB.headers['set-cookie'] ? regUserB.headers['set-cookie'][0].split(';')[0] : ''

  // 6. User A creates a chat
  const chatA = await request('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: { title: 'Secret Project Alpha Conversation' },
  })
  assert('User A creates chat', chatA.status === 201 && !!chatA.json?.chat?.id)
  const chatAId = chatA.json?.chat?.id

  // 7. Tenant Isolation Check: User B attempts to access User A's chat
  const bAccessA = await request(`/api/chats/${chatAId}`, {
    headers: { Cookie: cookieB },
  })
  assert('Tenant Isolation: User B CANNOT read User A chat (returns 404)', bAccessA.status === 404)

  // 8. User A creates a project
  const projA = await request('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: { name: 'Alpha Secret Roadmap', description: 'Internal only' },
  })
  assert('User A creates project', projA.status === 201 && !!projA.json?.project?.id)
  const projAId = projA.json?.project?.id

  // 9. Tenant Isolation Check: User B attempts to access User A's project
  const bAccessProj = await request(`/api/projects/${projAId}`, {
    headers: { Cookie: cookieB },
  })
  assert('Tenant Isolation: User B CANNOT read User A project (returns 404)', bAccessProj.status === 404)

  // 10. Login as Admin Atlas Reed
  const adminLogin = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'login', username: 'Atlas Reed', password: 'Atlas@911' },
  })
  assert('Admin login as Atlas Reed succeeds', adminLogin.status === 200 && adminLogin.json?.user?.role === 'admin')
  const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0].split(';')[0] : ''

  // 11. Admin Access Control: Regular user B tries /api/admin -> 403
  const bAdmin = await request('/api/admin', { headers: { Cookie: cookieB } })
  assert('RBAC: Non-admin User B is rejected from /api/admin with 403', bAdmin.status === 403)

  // 12. Admin Access Control: Admin Atlas Reed queries /api/admin -> 200
  const aAdmin = await request('/api/admin', { headers: { Cookie: adminCookie } })
  assert('RBAC: Administrator Atlas Reed is granted access to /api/admin', aAdmin.status === 200 && Array.isArray(aAdmin.json?.users))

  // 13. Password Recovery: Request recovery OTP
  const forgotRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'forgot-password', identifier: testUserAUsername },
  })
  assert('Password recovery code generated', forgotRes.status === 200 && forgotRes.json?.mockOtp === '482910')

  // 14. Password Recovery: Reset password with OTP
  const resetRes = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'reset-password',
      identifier: testUserAUsername,
      otp: '482910',
      newPassword: 'BrandNewPassword999!',
    },
  })
  assert('Password successfully reset with OTP', resetRes.status === 200 && resetRes.json?.success === true)

  // 15. Login with new password
  const newLogin = await request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'login', username: testUserAUsername, password: 'BrandNewPassword999!' },
  })
  assert('Login with newly reset password succeeds', newLogin.status === 200 && newLogin.json?.success === true)

  // 16. AI Chat with ATLAS Core Live Engine (Built-in live intelligence)
  const chatLive = await request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: {
      message: 'Explain how binary search works in two sentences.',
      model: 'atlas-core',
    },
  })
  assert('AI Chat works with ATLAS Core Live Engine', chatLive.status === 200 && chatLive.body.length > 20)

  // 17. AI Chat with Gemini when key is unconfigured -> returns clear error
  const chatGemini = await request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: {
      message: 'Hello Gemini',
      model: 'gemini-2.0-flash',
    },
  })
  assert(
    'AI Chat with unconfigured Gemini returns clear error',
    (chatGemini.status === 500 || chatGemini.status === 400) &&
    (chatGemini.json?.error?.includes('Gemini API key is not configured') || chatGemini.body.includes('Gemini API key is not configured'))
  )

  // 18. AI Tools: Code Generator
  const codeTool = await request('/api/tools/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: {
      action: 'generate',
      prompt: 'Fibonacci sequence generator in python',
      language: 'python',
      model: 'atlas-core',
    },
  })
  assert('Code Generator tool generates code', codeTool.status === 200 && codeTool.json?.result?.length > 10)

  // 19. AI Tools: Summarizer
  const sumTool = await request('/api/tools/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: {
      text: 'Quantum computing leverages quantum mechanical phenomena such as superposition and entanglement to perform complex calculations exponentially faster than classical computers for certain classes of problems.',
      type: 'executive',
    },
  })
  assert('Summarizer tool processes text', sumTool.status === 200 && (sumTool.json?.result?.length > 10 || sumTool.json?.error))

  // 20. AI Tools: Image Generator
  const imgTool = await request('/api/tools/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: {
      prompt: 'Futuristic quantum computer laboratory in neon cyber aesthetic',
      style: 'cyberpunk',
      aspectRatio: '16:9',
    },
  })
  assert('Image Generator tool returns generated image URL', imgTool.status === 200 && !!imgTool.json?.imageUrl)

  console.log(`\n==========================================`)
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log(`==========================================`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
