import { AIProvider, ChatMessage, ChatOptions } from './types'

/**
 * Clean query string for search and knowledge base lookups
 */
function cleanSearchQuery(query: string): string {
  return query
    .replace(/^(what is|who is|who wrote|where is|when did|explain|tell me about|how to|can you|please)\s+/i, '')
    .replace(/[?!.]+$/, '')
    .trim()
}

/**
 * Evaluate simple math expressions safely
 */
function trySolveMath(query: string): string | null {
  const mathPattern = /^\s*([\d.]+)\s*([+\-*/^%xX])\s*([\d.]+)\s*$/
  const match = query.match(mathPattern)
  if (match) {
    const a = parseFloat(match[1])
    const op = match[2].toLowerCase()
    const b = parseFloat(match[3])
    let result: number | null = null

    switch (op) {
      case '+': result = a + b; break
      case '-': result = a - b; break
      case '*':
      case 'x': result = a * b; break
      case '/': result = b !== 0 ? a / b : null; break
      case '^': result = Math.pow(a, b); break
      case '%': result = a % b; break
    }

    if (result !== null) {
      return `### 🧮 Mathematical Computation\n\n**Calculation:** \`${a} ${op} ${b}\`\n\n**Result:** **\`${result}\`**`
    }
  }

  // Check square root pattern
  const sqrtPattern = /^(?:sqrt|square root of)\s*([\d.]+)/i
  const sqrtMatch = query.match(sqrtPattern)
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1])
    return `### 🧮 Mathematical Computation\n\n**Calculation:** \`√${val}\`\n\n**Result:** **\`${Math.sqrt(val)}\`**`
  }

  return null
}

/**
 * Fallback code templates for common programming requests
 */
function tryGenerateCodeTemplate(query: string): string | null {
  const lower = query.toLowerCase()

  if (lower.includes('palindrome')) {
    return [
      '### 💻 Python Palindrome Solution',
      '',
      'Here is an efficient, clean function to check whether a string or number is a palindrome:',
      '',
      '```python',
      'def is_palindrome(text: str) -> bool:',
      '    """',
      '    Checks if the given string is a palindrome.',
      '    Ignores casing and non-alphanumeric characters.',
      '    """',
      '    clean = "".join(ch.lower() for ch in str(text) if ch.isalnum())',
      '    return clean == clean[::-1]',
      '',
      '# Example Usage:',
      'print(is_palindrome("racecar"))                         # True',
      'print(is_palindrome("A man, a plan, a canal: Panama"))  # True',
      'print(is_palindrome("atlas"))                           # False',
      '```',
      '',
      '**Time Complexity:** O(N) | **Space Complexity:** O(N)',
    ].join('\n')
  }

  if (lower.includes('reverse') && (lower.includes('string') || lower.includes('python'))) {
    return [
      '### 💻 Python String Reversal',
      '',
      'Here are the most idiomatic and efficient ways to reverse a string in Python:',
      '',
      '```python',
      '# 1. Slicing (Fastest & most Pythonic)',
      'def reverse_slice(s: str) -> str:',
      '    return s[::-1]',
      '',
      '# 2. Built-in reversed() with join()',
      'def reverse_builtin(s: str) -> str:',
      '    return "".join(reversed(s))',
      '',
      '# Example:',
      'text = "ATLAS AI"',
      'print(reverse_slice(text))  # IA SALTA',
      '```',
    ].join('\n')
  }

  if (lower.includes('quicksort') || lower.includes('quick sort')) {
    return [
      '### 💻 Quicksort Algorithm (Python)',
      '',
      '```python',
      'def quicksort(arr: list) -> list:',
      '    if len(arr) <= 1:',
      '        return arr',
      '    pivot = arr[len(arr) // 2]',
      '    left = [x for x in arr if x < pivot]',
      '    middle = [x for x in arr if x == pivot]',
      '    right = [x for x in arr if x > pivot]',
      '    return quicksort(left) + middle + quicksort(right)',
      '',
      '# Example:',
      'print(quicksort([3, 6, 8, 10, 1, 2, 1]))',
      '# Output: [1, 1, 2, 3, 6, 8, 10]',
      '```',
      '',
      '**Time Complexity:** Average O(N log N), Worst O(N²)',
    ].join('\n')
  }

  return null
}

/**
 * Intelligent Local ATLAS AI Provider
 * Connects to live multi-engine LLM (Llama 3.2 Instruct) and Wikipedia Knowledge Base.
 * Delivers direct, accurate, professional answers with zero external branding or clutter.
 */
export class LocalAtlasProvider implements AIProvider {
  name = 'ATLAS Core Live Engine'

  async generateText(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const lastUserMsg = messages[messages.length - 1]?.content || ''
    const cleanQuery = cleanSearchQuery(lastUserMsg)

    // 1. Check for quick math
    const mathResult = trySolveMath(cleanQuery) || trySolveMath(lastUserMsg)
    if (mathResult) {
      return mathResult
    }

    // 2. Primary: Live Neural LLM Generation (Llama 3.2 Instruct via DevToolbox)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)

      // Build conversation context prompt
      const systemInstruction =
        options?.systemPrompt ||
        'You are ATLAS AI, an intelligent, professional, and helpful AI assistant. Tagline: Chat. Create. Code. Learn. Provide direct, accurate, structured, and high-quality responses.'

      const historySnippets = messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n')
      const formattedPrompt = `${systemInstruction}\n\n${historySnippets}\n\nAssistant:`

      const res = await fetch('https://devtoolbox-api.devtoolbox-api.workers.dev/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: formattedPrompt }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        const reply = data?.response?.trim()
        if (reply && reply.length > 5) {
          return reply
        }
      }
    } catch {
      // Fall through to secondary knowledge engine
    }

    // 3. Secondary: Wikipedia Knowledge Base Extraction
    try {
      const queryToSearch = cleanQuery || lastUserMsg
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryToSearch)}&limit=1&format=json`
      )
      if (searchRes.ok) {
        const searchData = await searchRes.json()
        const matchedTitle = searchData?.query?.search?.[0]?.title
        if (matchedTitle) {
          const sumRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(matchedTitle.replace(/ /g, '_'))}`
          )
          if (sumRes.ok) {
            const sumData = await sumRes.json()
            if (sumData.extract && sumData.extract.length > 20) {
              return [
                `### 📖 ${sumData.title}`,
                '',
                sumData.extract,
                '',
                sumData.description ? `*(${sumData.description})*` : '',
              ].filter(Boolean).join('\n')
            }
          }
        }
      }
    } catch {
      // Fall through
    }

    // 4. Check algorithmic code templates
    const codeResult = tryGenerateCodeTemplate(lastUserMsg)
    if (codeResult) {
      return codeResult
    }

    // 5. Contextual Fallback Response
    return [
      `### ⚡ ATLAS AI Intelligence`,
      '',
      `Regarding **"${lastUserMsg}"**:`,
      '',
      `I am processing your query. For personalized code generation or complex creative queries, please ensure your question specifies the desired language or format.`,
    ].join('\n')
  }

  async streamText(
    messages: ChatMessage[],
    options: ChatOptions,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const response = await this.generateText(messages, options)
    const words = response.split(' ')

    for (let i = 0; i < words.length; i++) {
      onChunk(words[i] + (i < words.length - 1 ? ' ' : ''))
      // Natural typing cadence
      await new Promise(r => setTimeout(r, 12))
    }

    return response
  }
}
