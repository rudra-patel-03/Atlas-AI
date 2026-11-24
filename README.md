# ATLAS AI — Production Full-Stack AI Platform

> **Chat. Create. Code. Learn.**  
> *Official Instagram:* [@atlas.ai.tools](https://instagram.com/atlas.ai.tools)

ATLAS AI is an enterprise-grade full-stack artificial intelligence platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, multi-model AI reasoning (Google Gemini, OpenAI, and local Atlas Engine), and complete user security.

---

## 🚀 Key Features

1. **Compulsory Authentication System:**
   - Root `/` strictly guards the workspace and redirects unauthenticated visitors to `/auth/login`.
   - Dedicated **Login** (`/auth/login`) with username/email, password visibility toggle, OTP recovery link, and one-click demo accounts (`@atlasreed` and `🛡️ @admin`).
   - Dedicated **Sign In / Registration** (`/auth/signup`) with Full Name, unique Username (`@`), Email ID, Create Password, Rewrite Password with real-time match validation, and Terms acceptance.
   - **Google Account Chooser Dialog:** Interactive Google OAuth modal supporting preset accounts and custom Google accounts without silent bypass.
   - Dual-tier role-based access control (`user` and `admin`).
   - Rate limiting (12 req/min per IP) to prevent credential stuffing.
   - Enterprise security headers (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).

2. **Multi-Mode UI:**
   - **Theme Modes:** Dark Mode, Light Mode, and Device Mode (auto-detects operating system color scheme with zero flicker).
   - **View Modes:** Instant toggle between full-width **Desktop Web View** and simulated **Mobile View** (interactive smartphone chassis with iPhone 16 Pro, Google Pixel 9, and Compact SE presets, plus zoom scaling).

3. **13 Integrated Functional AI Tools:**
   - 💬 **AI Chat:** Multi-turn conversational streaming with markdown, code syntax highlighting, copy, and branch persistence.
   - 💻 **Code Architect:** Generate, explain, debug, and optimize across 20+ languages.
   - 🎨 **Image Studio:** Text-to-image synthesis with aspect ratios and styles.
   - 🎥 **Video Generator:** Cinematic prompt engineering and storyboard synthesis.
   - 🎙️ **Voice Maker:** Neural text-to-speech engine.
   - 🗣️ **Voice Chat:** Interactive real-time conversational voice assistant.
   - ⚡ **Prompt Generator:** Professional prompts for coding, creative, and business tasks.
   - 📑 **PDF Maker:** Structured document and PDF generation.
   - 📄 **Document Intelligence:** File summarization, contract auditing, and Q&A.
   - 📝 **Summarizer:** Executive briefs, bulleted takeaways, and chapter summaries.
   - 🧠 **Notes & Flashcards:** Cornell notes, active recall flashcards, and exam Q&A.
   - 🌐 **Translator:** Multi-language neural translation.
   - 🔬 **Deep Research:** Multi-step investigation separating verified facts from AI extrapolations.

4. **Autonomous AI Agents & Workspaces:**
   - 7 Pre-configured specialized personas (Code Architect, Socratic Tutor, Deep Research Analyst, etc.) and custom agent creator.
   - Project workspaces with dedicated chats, notes, files, and sandboxes.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 3.4 (Dark navy theme `#030712`, electric blue `#0066FF`, cyan `#00e5ff`)
- **Icons:** Lucide React
- **AI Providers:** `@google/generative-ai` (Gemini 2.0 Flash / 1.5 Pro), OpenAI compatibility layer, Atlas Offline Fallback Engine
- **Persistence:** Local JSON Vector Store (`.data/atlas_db.json`) + Supabase PostgreSQL schema ready
- **PDF Generation:** `jspdf`

---

## 🧪 Automated Testing

ATLAS AI includes an end-to-end automated test suite covering all 49 routes, authentication flows, and tool APIs:

```bash
# Run comprehensive test suite
npm test
```

Expected output:
```
TOTAL TESTS: 49 | PASSED: 49 | FAILED: 0
```

---

## 🚢 Deployment Guide

### Option 1: Deploy to Vercel (Recommended)

1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set Environment Variables in Project Settings:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `ATLAS_SESSION_SECRET`: Random 32+ character string
4. Click **Deploy**. Vercel will automatically build and deploy across edge nodes.

---

### Option 2: Deploy with Docker

A production multi-stage `Dockerfile` is included:

```bash
# 1. Build Docker image
docker build -t atlas-ai .

# 2. Run container
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY="your_api_key_here" \
  -e NODE_ENV="production" \
  --name atlas-ai-container \
  atlas-ai
```

The container exposes port `3000` with non-root security privileges (`nextjs` user).

---

### Option 3: Deploy to Linux VPS (Ubuntu/Debian with PM2 & Nginx)

1. **Clone repository:**
   ```bash
   git clone <repo-url> atlas-ai
   cd atlas-ai
   npm install --production=false
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   nano .env.local
   ```

3. **Build production bundle:**
   ```bash
   npm run build
   ```

4. **Start with PM2 process manager:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "atlas-ai" -- start
   pm2 startup
   pm2 save
   ```

5. **Nginx Reverse Proxy configuration (`/etc/nginx/sites-available/atlas`):**
   ```nginx
   server {
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔑 Default Credentials

- **Standard User (Atlas Reed):** `atlasreed` / `Atlas@12345`
- **Administrator:** `admin` / `Admin@12345`
- **Google OAuth:** Select Atlas Reed, Rudra Patel, or enter any custom Google Account.
