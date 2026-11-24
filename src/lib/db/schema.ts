export interface User {
  id: string
  name: string
  username: string
  email: string
  passwordHash: string
  role: 'user' | 'admin'
  avatar?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface Chat {
  id: string
  userId: string
  title: string
  pinned: boolean
  saved: boolean
  projectId?: string
  model: string
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  name: string
  type: string
  size: number
  url: string
}

export interface Message {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  attachments?: Attachment[]
  createdAt: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string
  category: string
  instructions: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FileRecord {
  id: string
  userId: string
  name: string
  size: number
  type: string
  url: string
  projectId?: string
  createdAt: string
}

export interface AIAgent {
  id: string
  userId?: string
  name: string
  role: string
  description: string
  instructions: string
  avatar: string
  model: string
  category: string
  isDefault: boolean
  createdAt: string
}

export interface ToolUsage {
  id: string
  userId: string
  toolName: string
  tokensUsed: number
  status: 'success' | 'error'
  createdAt: string
}

export interface UserSettings {
  userId: string
  theme: 'dark' | 'light' | 'system'
  defaultModel: string
  language: string
  notifications: boolean
  geminiApiKey?: string
  openaiApiKey?: string
}
