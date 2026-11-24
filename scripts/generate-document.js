const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '..')

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.vercel',
  'out',
  'coverage',
  '.data',
])

const EXCLUDE_EXTS = new Set([
  '.exe',
  '.zip',
  '.tar',
  '.gz',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.mp3',
  '.pdf',
])

const EXCLUDE_FILES = new Set([
  'package-lock.json',
  'err.log',
  'out.log',
  'cloudflared.exe',
  'atlas-ai-vercel.zip',
  'DOCUMENT',
  'DOCUMENT.txt',
  'DOCUMENT.md',
])

function collectFiles(dir) {
  let fileList = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    if (EXCLUDE_DIRS.has(item)) continue
    if (EXCLUDE_FILES.has(item)) continue

    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      fileList = fileList.concat(collectFiles(fullPath))
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase()
      if (EXCLUDE_EXTS.has(ext)) continue
      fileList.push(fullPath)
    }
  }

  return fileList
}

function generate() {
  const allFiles = collectFiles(ROOT_DIR)
  allFiles.sort()

  console.log(`Found ${allFiles.length} source code and configuration files.`)

  const timestamp = new Date().toISOString()
  let doc = []

  doc.push('================================================================================')
  doc.push('ATLAS AI — COMPLETE SOURCE CODE ARCHIVE & SYSTEM DOCUMENTATION')
  doc.push(`Generated: ${timestamp}`)
  doc.push(`Total Files: ${allFiles.length}`)
  doc.push('Repository: ATLAS AI Sovereign Intelligence Platform')
  doc.push('================================================================================\n')

  doc.push('TABLE OF CONTENTS:')
  doc.push('--------------------------------------------------------------------------------')
  allFiles.forEach((file, index) => {
    const rel = path.relative(ROOT_DIR, file).replace(/\\/g, '/')
    doc.push(`${String(index + 1).padStart(3, ' ')}. ${rel}`)
  })
  doc.push('--------------------------------------------------------------------------------\n\n')

  let totalLines = 0

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i]
    const rel = path.relative(ROOT_DIR, file).replace(/\\/g, '/')
    let content = ''
    try {
      content = fs.readFileSync(file, 'utf8')
    } catch (e) {
      content = `// Error reading file: ${e.message}`
    }

    const lines = content.split('\n')
    totalLines += lines.length

    doc.push('================================================================================')
    doc.push(`FILE [${i + 1}/${allFiles.length}]: ${rel}`)
    doc.push(`LINES: ${lines.length} | BYTES: ${Buffer.byteLength(content, 'utf8')}`)
    doc.push('================================================================================')
    doc.push(content)
    doc.push('\n')
  }

  doc.push('================================================================================')
  doc.push(`END OF ATLAS AI COMPLETE SOURCE CODE ARCHIVE`)
  doc.push(`TOTAL FILES: ${allFiles.length} | TOTAL LINES OF CODE: ${totalLines}`)
  doc.push('================================================================================')

  const fullText = doc.join('\n')

  const outTxt = path.join(ROOT_DIR, 'DOCUMENT.txt')
  const outMd = path.join(ROOT_DIR, 'DOCUMENT.md')
  const outBare = path.join(ROOT_DIR, 'DOCUMENT')

  fs.writeFileSync(outTxt, fullText, 'utf8')
  fs.writeFileSync(outMd, fullText, 'utf8')
  fs.writeFileSync(outBare, fullText, 'utf8')

  console.log(`SUCCESS! Generated master files:`)
  console.log(` - ${outTxt} (${(fullText.length / 1024).toFixed(1)} KB, ${totalLines} lines)`)
  console.log(` - ${outMd}`)
  console.log(` - ${outBare}`)

  return { totalFiles: allFiles.length, totalLines, sizeKb: (fullText.length / 1024).toFixed(1) }
}

generate()
