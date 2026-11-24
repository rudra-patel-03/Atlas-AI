// Test intelligent local provider logic
async function fetchAI(prompt) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 9000)
    const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt) + '?model=openai-fast', {
      signal: controller.signal
    })
    clearTimeout(timer)
    if (res.ok) {
      const text = await res.text()
      if (text && !text.includes('Free limit reached') && text.trim().length > 5) {
        return text.trim()
      }
    }
  } catch (e) {
    console.warn('Pollinations fallback:', e.message)
  }

  // Fallback: Wikipedia REST API
  try {
    const searchRes = await fetch('https://en.wikipedia.org/w/api.php?action=opensearch&search=' + encodeURIComponent(prompt) + '&limit=1&format=json')
    if (searchRes.ok) {
      const data = await searchRes.json()
      const title = data[1]?.[0]
      if (title) {
        const sumRes = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title))
        if (sumRes.ok) {
          const sumData = await sumRes.json()
          if (sumData.extract) {
            return `### ${sumData.title}\n\n${sumData.extract}\n\n*Source: Wikipedia Knowledge Base*`
          }
        }
      }
    }
  } catch (e) {
    console.warn('Wiki fallback:', e.message)
  }

  return `Here is the information regarding "${prompt}". For real-time updates, you can verify via ChatGPT or Google Search.`
}

async function run() {
  const ans1 = await fetchAI('What is the speed of light in vacuum?')
  console.log('Test 1 (Speed of light):', ans1)
  const ans2 = await fetchAI('Who wrote Romeo and Juliet?')
  console.log('Test 2 (Shakespeare):', ans2)
}

run()
