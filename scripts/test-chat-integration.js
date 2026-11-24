const { LocalAtlasProvider } = require('../src/lib/ai/mock')

async function runTests() {
  console.log('--- STARTING ATLAS AI CHAT & SEARCH INTEGRATION VERIFICATION ---')
  const provider = new LocalAtlasProvider()
  let passed = 0
  let total = 0

  function assert(condition, name) {
    total++
    if (condition) {
      console.log(`[PASS] ${name}`)
      passed++
    } else {
      console.error(`[FAIL] ${name}`)
    }
  }

  // Test 1: Math calculation
  const mathAnswer = await provider.generateText([{ role: 'user', content: '15 * 15' }])
  assert(mathAnswer.includes('225'), 'Math computation (15 * 15 = 225)')
  assert(mathAnswer.includes('https://chatgpt.com/?q='), 'ChatGPT external link present in math response')
  assert(mathAnswer.includes('https://www.google.com/search?q='), 'Google Search external link present in math response')

  // Test 2: Palindrome code synthesis
  const codeAnswer = await provider.generateText([{ role: 'user', content: 'Write a python function to check if word is palindrome' }])
  assert(codeAnswer.includes('def is_palindrome') || codeAnswer.includes('palindrome'), 'Code synthesis: Python Palindrome')
  assert(codeAnswer.includes('https://www.perplexity.ai/search?q='), 'Perplexity link present in code response')
  assert(codeAnswer.includes('https://duckduckgo.com/?q='), 'DuckDuckGo link present in code response')

  // Test 3: Factual knowledge
  const factAnswer = await provider.generateText([{ role: 'user', content: 'Albert Einstein' }])
  assert(factAnswer.length > 50, 'Factual knowledge retrieval produces detailed response')

  // Test 4: Streaming functionality
  let streamed = ''
  await provider.streamText([{ role: 'user', content: '10 + 20' }], {}, chunk => {
    streamed += chunk
  })
  assert(streamed.includes('30'), 'Streaming functionality produces tokens and computes 30')

  console.log(`\nResults: ${passed}/${total} checks passed.`)
  if (passed === total) {
    console.log('ALL CHAT & SEARCH LINKING TESTS PASSED PERFECTLY!')
    process.exit(0)
  } else {
    process.exit(1)
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err)
  process.exit(1)
})
