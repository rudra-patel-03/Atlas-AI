import fs from 'fs'
import path from 'path'
import {
  User,
  Chat,
  Message,
  Project,
  FileRecord,
  AIAgent,
  ToolUsage,
  UserSettings,
} from './schema'

interface DatabaseData {
  users: User[]
  chats: Chat[]
  messages: Message[]
  projects: Project[]
  files: FileRecord[]
  agents: AIAgent[]
  toolUsage: ToolUsage[]
  settings: Record<string, UserSettings>
}

const DATA_DIR = path.join(process.cwd(), '.data')
const DB_FILE = path.join(DATA_DIR, 'atlas_db.json')

// Default pre-configured AI Agents
const DEFAULT_AGENTS: AIAgent[] = [
  {
    id: 'agent-coding',
    name: 'Atlas Code Architect',
    role: 'Senior Full-Stack & Systems Engineer',
    description: 'Expert in algorithmic design, debugging, modern frameworks, and clean code principles across 20+ programming languages.',
    instructions: 'You are Atlas Code Architect, an elite full-stack engineer and software architect. Provide clean, secure, production-grade code with TypeScript/modern idioms. Explain design decisions, edge cases, and performance considerations clearly.',
    avatar: '💻',
    model: 'gemini-2.0-flash',
    category: 'Engineering',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-study',
    name: 'Socratic Study Tutor',
    role: 'Personal Academic Mentor',
    description: 'Breaks complex academic subjects down into intuitive concepts, active recall quizzes, and structured learning paths.',
    instructions: 'You are the Socratic Study Tutor. Explain concepts using analogies, active questioning, step-by-step proofs, and mnemonic devices. Encourage critical thinking.',
    avatar: '🎓',
    model: 'gemini-2.0-flash',
    category: 'Education',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-research',
    name: 'Deep Research Analyst',
    role: 'Quantitative & Qualitative Researcher',
    description: 'Synthesizes literature, analyzes market data, structures formal whitepapers, and provides strict source attribution.',
    instructions: 'You are the Deep Research Analyst. Formulate objective, evidence-based syntheses. Always separate verified empirical data from hypothetical extrapolation, cite sources, and structure findings into executive summaries.',
    avatar: '🔬',
    model: 'gemini-1.5-pro',
    category: 'Research',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-writing',
    name: 'Executive Content Strategist',
    role: 'Creative & Technical Copywriter',
    description: 'Crafts high-impact essays, professional articles, technical documentation, marketing copy, and thought leadership pieces.',
    instructions: 'You are the Executive Content Strategist. Produce punchy, evocative, precise prose. Adapt tone seamlessly between technical documentation, narrative storytelling, and persuasive executive briefs.',
    avatar: '✍️',
    model: 'gemini-2.0-flash',
    category: 'Creative',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-document',
    name: 'Document Intelligence Specialist',
    role: 'Document Auditor & Analyst',
    description: 'Parses complex legal contracts, research PDFs, financial sheets, and specifications for key clauses, risks, and summaries.',
    instructions: 'You are the Document Intelligence Specialist. Extract core metrics, cross-examine clauses, uncover latent risks, and deliver structured digests of uploaded documentation.',
    avatar: '📄',
    model: 'gemini-1.5-pro',
    category: 'Productivity',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-productivity',
    name: 'GTD Flow Coordinator',
    role: 'Productivity & Execution Coach',
    description: 'Transforms ambitious goals into sprint roadmaps, prioritizes tasks with Eisenhower matrices, and drafts meeting agendas.',
    instructions: 'You are the GTD Flow Coordinator. Maximize human focus and operational velocity. Provide prioritized checklists, time-boxed agendas, and actionable roadmaps.',
    avatar: '⚡',
    model: 'gemini-2.0-flash',
    category: 'Productivity',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-cybersecurity',
    name: 'Cyber Sentinel Mentor',
    role: 'Ethical Hacking & SecOps Educator',
    description: 'Teaches defensive security, threat modeling, vulnerability triage (OWASP Top 10), and cryptography principles.',
    instructions: 'You are the Cyber Sentinel Mentor. Teach ethical cybersecurity concepts, secure code review, threat modeling, and defensive tactics strictly within ethical learning boundaries.',
    avatar: '🛡️',
    model: 'gemini-2.0-flash',
    category: 'Security',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
]

// Simple SHA-256 password hash helper
function hashPassword(password: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(password + 'atlas_ai_salt_2026').digest('hex')
}

// Initial default seed
function getInitialData(): DatabaseData {
  return {
    users: [
      {
        id: 'usr-admin-001',
        name: 'Atlas Reed',
        username: 'atlasreed',
        email: 'atlasreed@atlas.ai',
        passwordHash: hashPassword('Atlas@911'),
        role: 'admin',
        avatar: '/assets/logo.jpg',
        bio: 'Lead Administrator & AI Architect of ATLAS AI Platform',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-demo-002',
        name: 'Rudra Patel',
        username: 'rudra',
        email: 'rudra@atlas.ai',
        passwordHash: hashPassword('Rudra@12345'),
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=rudra',
        bio: 'AI researcher and full-stack software engineer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    chats: [
      {
        id: 'chat-welcome-001',
        userId: 'usr-demo-002',
        title: 'Exploring ATLAS AI Capabilities',
        pinned: true,
        saved: true,
        model: 'gemini-2.0-flash',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    messages: [
      {
        id: 'msg-001',
        chatId: 'chat-welcome-001',
        role: 'user',
        content: 'Hello ATLAS AI! What can you help me build and research today?',
        createdAt: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: 'msg-002',
        chatId: 'chat-welcome-001',
        role: 'assistant',
        content: `Welcome to **ATLAS AI** — *Chat. Create. Code. Learn.* ⚡\n\nI am your intelligent workspace designed for high-performance productivity. Here is what we can accomplish right now:\n\n1. **AI Chat & Deep Reasoning**: Multi-turn contextual dialogues with code synthesis, document synthesis, and voice interaction.\n2. **Code Generator & Optimizer**: Full-stack solutions across TypeScript, Python, C++, Go, Rust, and SQL with debugging and complexity analysis.\n3. **Creative Studio**: High-resolution image generation, video prompts, and neural text-to-speech.\n4. **Deep Research Assistant**: Multi-source empirical investigation with structured citations and fact separation.\n5. **Document & PDF Intelligence**: Instant PDF extraction, contract reviews, automated study notes, and flashcards.\n\nType your query or pick one of the dedicated AI tools in the sidebar to get started!`,
        createdAt: new Date(Date.now() - 3400000).toISOString(),
      },
    ],
    projects: [
      {
        id: 'proj-001',
        userId: 'usr-demo-002',
        name: 'Autonomous Agent Platform',
        description: 'Building multi-agent autonomous workflows with persistent vector memory and function calling.',
        category: 'Coding Projects',
        instructions: 'Focus on distributed asynchronous architectures, TypeScript type safety, and clean API design.',
        notes: 'Target launch: Q3. Needs benchmark against real workloads.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj-002',
        userId: 'usr-demo-002',
        name: 'Quantum Computing Research',
        description: 'Literature review on variational quantum eigensolvers for chemical simulation.',
        category: 'Research Projects',
        instructions: 'Maintain rigorous citation of peer-reviewed arXiv and Nature papers.',
        notes: 'Compile equations into KaTeX and compare NISQ algorithms.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    files: [
      {
        id: 'file-001',
        userId: 'usr-demo-002',
        name: 'Atlas_Architecture_Spec.pdf',
        size: 1420500,
        type: 'application/pdf',
        url: '/uploads/Atlas_Architecture_Spec.pdf',
        projectId: 'proj-001',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'file-002',
        userId: 'usr-demo-002',
        name: 'Neural_Training_Dataset.csv',
        size: 894000,
        type: 'text/csv',
        url: '/uploads/Neural_Training_Dataset.csv',
        projectId: 'proj-001',
        createdAt: new Date().toISOString(),
      },
    ],
    agents: DEFAULT_AGENTS,
    toolUsage: [
      {
        id: 'usage-001',
        userId: 'usr-demo-002',
        toolName: 'Code Generator',
        tokensUsed: 1420,
        status: 'success',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'usage-002',
        userId: 'usr-demo-002',
        toolName: 'AI Chat',
        tokensUsed: 2350,
        status: 'success',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'usage-003',
        userId: 'usr-demo-002',
        toolName: 'Deep Research',
        tokensUsed: 4210,
        status: 'success',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
    settings: {
      'usr-demo-002': {
        userId: 'usr-demo-002',
        theme: 'dark',
        defaultModel: 'gemini-2.0-flash',
        language: 'en',
        notifications: true,
      },
      'usr-admin-001': {
        userId: 'usr-admin-001',
        theme: 'dark',
        defaultModel: 'gemini-2.0-flash',
        language: 'en',
        notifications: true,
      },
    },
  }
}

class Database {
  private data: DatabaseData

  constructor() {
    this.data = this.load()
  }

  private load(): DatabaseData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8')
        const parsed = JSON.parse(raw)
        if (!parsed.agents || parsed.agents.length === 0) {
          parsed.agents = DEFAULT_AGENTS
        }
        // Guarantee ONLY ONE admin account: "Atlas Reed" / "Atlas@911"
        if (parsed.users && Array.isArray(parsed.users)) {
          // Remove old 'admin' username
          parsed.users = parsed.users.filter((u: any) => u.username !== 'admin' && u.id !== 'usr-wzgkaa8')

          let adminFound = false
          parsed.users.forEach((u: any) => {
            if (u.id === 'usr-admin-001' || u.username === 'atlasreed') {
              u.id = 'usr-admin-001'
              u.name = 'Atlas Reed'
              u.username = 'atlasreed'
              u.email = 'atlasreed@atlas.ai'
              u.passwordHash = hashPassword('Atlas@911')
              u.role = 'admin'
              u.avatar = '/assets/logo.jpg'
              adminFound = true
            } else if (u.role === 'admin') {
              // Ensure NO other user has admin role
              u.role = 'user'
            }
          })

          if (!adminFound) {
            parsed.users.unshift({
              id: 'usr-admin-001',
              name: 'Atlas Reed',
              username: 'atlasreed',
              email: 'atlasreed@atlas.ai',
              passwordHash: hashPassword('Atlas@911'),
              role: 'admin',
              avatar: '/assets/logo.jpg',
              bio: 'Lead Administrator & AI Architect of ATLAS AI Platform',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }
        }
        return parsed
      }
    } catch (e) {
      console.error('Error loading DB file, reinitializing', e)
    }
    const initial = getInitialData()
    this.saveData(initial)
    return initial
  }

  private saveData(data: DatabaseData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
    } catch (e) {
      console.error('Failed to save DB file', e)
    }
  }

  public save() {
    this.saveData(this.data)
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users
  }

  public findUserByEmail(email: string): User | undefined {
    const clean = email.toLowerCase().trim()
    return this.data.users.find(u => u.email?.toLowerCase() === clean)
  }

  public findUserByUsername(username: string): User | undefined {
    const clean = username.toLowerCase().trim()
    return this.data.users.find(u => (u.username ? u.username.toLowerCase() === clean : false))
  }

  public findUserByUsernameOrEmail(identifier: string): User | undefined {
    if (!identifier) return undefined
    const raw = identifier.trim()
    const clean = raw.toLowerCase().replace(/^@/, '').trim()
    const cleanNoSpaces = clean.replace(/\s+/g, '')

    // Check admin Atlas Reed matches first
    if (
      clean === 'atlas reed' ||
      clean === 'atlasreed' ||
      cleanNoSpaces === 'atlasreed' ||
      clean === 'atlasreed@atlas.ai'
    ) {
      const admin = this.data.users.find(u => u.id === 'usr-admin-001' || (u.role === 'admin' && u.username === 'atlasreed'))
      if (admin) return admin
    }

    return this.data.users.find(
      u =>
        (u.username && (
          u.username.toLowerCase() === clean ||
          u.username.toLowerCase() === cleanNoSpaces ||
          u.username.toLowerCase() === raw.toLowerCase()
        )) ||
        (u.email && u.email.toLowerCase() === clean) ||
        (u.name && (
          u.name.toLowerCase().trim() === clean ||
          u.name.toLowerCase().replace(/\s+/g, '') === cleanNoSpaces ||
          u.name.toLowerCase().trim() === raw.toLowerCase()
        ))
    )
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id)
  }

  public createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.data.users.push(newUser)
    this.save()
    return newUser
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id)
    if (idx === -1) return undefined
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.save()
    return this.data.users[idx]
  }

  public deleteUser(id: string): boolean {
    const target = this.data.users.find(u => u.id === id)
    if (!target) return false
    // Protect primary admin Atlas Reed from deletion
    if (target.id === 'usr-admin-001' || target.username?.toLowerCase() === 'atlasreed') {
      return false
    }

    const initialLen = this.data.users.length
    this.data.users = this.data.users.filter(u => u.id !== id)

    if (this.data.users.length < initialLen) {
      if (this.data.settings && this.data.settings[id]) {
        delete this.data.settings[id]
      }
      if (this.data.chats) {
        this.data.chats = this.data.chats.filter(c => c.userId !== id)
      }
      if (this.data.toolUsage) {
        this.data.toolUsage = this.data.toolUsage.filter(u => u.userId !== id)
      }
      this.save()
      return true
    }
    return false
  }

  // --- Chats ---
  public getChats(userId: string): Chat[] {
    return this.data.chats
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  public getChat(id: string, userId: string): Chat | undefined {
    return this.data.chats.find(c => c.id === id && c.userId === userId)
  }

  public createChat(userId: string, title = 'New Conversation', model = 'gemini-2.0-flash', projectId?: string): Chat {
    const newChat: Chat = {
      id: 'chat-' + Math.random().toString(36).substring(2, 9),
      userId,
      title,
      pinned: false,
      saved: false,
      model,
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.data.chats.unshift(newChat)
    this.save()
    return newChat
  }

  public updateChat(id: string, userId: string, updates: Partial<Chat>): Chat | undefined {
    const idx = this.data.chats.findIndex(c => c.id === id && c.userId === userId)
    if (idx === -1) return undefined
    this.data.chats[idx] = {
      ...this.data.chats[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.save()
    return this.data.chats[idx]
  }

  public deleteChat(id: string, userId: string): boolean {
    const initialLen = this.data.chats.length
    this.data.chats = this.data.chats.filter(c => !(c.id === id && c.userId === userId))
    this.data.messages = this.data.messages.filter(m => m.chatId !== id)
    this.save()
    return this.data.chats.length < initialLen
  }

  // --- Messages ---
  public getMessages(chatId: string): Message[] {
    return this.data.messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  public addMessage(chatId: string, role: 'user' | 'assistant' | 'system', content: string, attachments?: any[]): Message {
    const newMsg: Message = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      chatId,
      role,
      content,
      attachments,
      createdAt: new Date().toISOString(),
    }
    this.data.messages.push(newMsg)
    const chat = this.data.chats.find(c => c.id === chatId)
    if (chat) {
      chat.updatedAt = new Date().toISOString()
    }
    this.save()
    return newMsg
  }

  // --- Projects ---
  public getProjects(userId: string): Project[] {
    return this.data.projects
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  public getProject(id: string, userId: string): Project | undefined {
    return this.data.projects.find(p => p.id === id && p.userId === userId)
  }

  public createProject(userId: string, data: Partial<Project>): Project {
    const project: Project = {
      id: 'proj-' + Math.random().toString(36).substring(2, 9),
      userId,
      name: data.name || 'Untitled Project',
      description: data.description || '',
      category: data.category || 'General',
      instructions: data.instructions || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.data.projects.unshift(project)
    this.save()
    return project
  }

  public updateProject(id: string, userId: string, updates: Partial<Project>): Project | undefined {
    const idx = this.data.projects.findIndex(p => p.id === id && p.userId === userId)
    if (idx === -1) return undefined
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.save()
    return this.data.projects[idx]
  }

  public deleteProject(id: string, userId: string): boolean {
    const initial = this.data.projects.length
    this.data.projects = this.data.projects.filter(p => !(p.id === id && p.userId === userId))
    this.save()
    return this.data.projects.length < initial
  }

  // --- Files ---
  public getFiles(userId: string, projectId?: string): FileRecord[] {
    return this.data.files
      .filter(f => f.userId === userId && (!projectId || f.projectId === projectId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  public createFile(userId: string, file: Omit<FileRecord, 'id' | 'userId' | 'createdAt'>): FileRecord {
    const newFile: FileRecord = {
      ...file,
      id: 'file-' + Math.random().toString(36).substring(2, 9),
      userId,
      createdAt: new Date().toISOString(),
    }
    this.data.files.unshift(newFile)
    this.save()
    return newFile
  }

  public deleteFile(id: string, userId: string): boolean {
    const initial = this.data.files.length
    this.data.files = this.data.files.filter(f => !(f.id === id && f.userId === userId))
    this.save()
    return this.data.files.length < initial
  }

  public renameFile(id: string, userId: string, newName: string): FileRecord | undefined {
    const file = this.data.files.find(f => f.id === id && f.userId === userId)
    if (file) {
      file.name = newName
      this.save()
    }
    return file
  }

  // --- Agents ---
  public getAgents(userId?: string): AIAgent[] {
    return this.data.agents.filter(a => a.isDefault || a.userId === userId)
  }

  public getAgent(id: string): AIAgent | undefined {
    return this.data.agents.find(a => a.id === id)
  }

  public createAgent(userId: string, agent: Omit<AIAgent, 'id' | 'userId' | 'isDefault' | 'createdAt'>): AIAgent {
    const newAgent: AIAgent = {
      ...agent,
      id: 'agent-' + Math.random().toString(36).substring(2, 9),
      userId,
      isDefault: false,
      createdAt: new Date().toISOString(),
    }
    this.data.agents.push(newAgent)
    this.save()
    return newAgent
  }

  public deleteAgent(id: string, userId: string): boolean {
    const initial = this.data.agents.length
    this.data.agents = this.data.agents.filter(a => !(a.id === id && a.userId === userId && !a.isDefault))
    this.save()
    return this.data.agents.length < initial
  }

  // --- Tool Usage ---
  public logToolUsage(userId: string, toolName: string, tokensUsed = 100, status: 'success' | 'error' = 'success') {
    const usage: ToolUsage = {
      id: 'usage-' + Math.random().toString(36).substring(2, 9),
      userId,
      toolName,
      tokensUsed,
      status,
      createdAt: new Date().toISOString(),
    }
    this.data.toolUsage.push(usage)
    this.save()
    return usage
  }

  public getToolUsageStats() {
    return this.data.toolUsage
  }

  // --- Settings ---
  public getSettings(userId: string): UserSettings {
    if (!this.data.settings[userId]) {
      this.data.settings[userId] = {
        userId,
        theme: 'dark',
        defaultModel: 'gemini-2.0-flash',
        language: 'en',
        notifications: true,
      }
      this.save()
    }
    return this.data.settings[userId]
  }

  public updateSettings(userId: string, updates: Partial<UserSettings>): UserSettings {
    const current = this.getSettings(userId)
    this.data.settings[userId] = {
      ...current,
      ...updates,
    }
    this.save()
    return this.data.settings[userId]
  }
}

// Global Singleton
declare global {
  var __atlasDb: Database | undefined
}

export const db: Database = global.__atlasDb || new Database()
if (process.env.NODE_ENV !== 'production') {
  global.__atlasDb = db
}
export { hashPassword }
