# FOKUS - The ADHD Execution Layer for Your Second Brain 🧠

**Capture everything. Execute immediately. Export to your knowledge base.**

FOKUS is the missing bridge between your chaotic thoughts and your structured Second Brain (Obsidian, Notion, etc.). It's designed specifically for ADHD/INTP minds that struggle with the friction of traditional knowledge management tools.

![FOKUS Banner](https://img.shields.io/badge/PWA-Ready-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6) ![React](https://img.shields.io/badge/React-19-61DAFB)

## 🚨 The Problem
- **Obsidian/Notion** are great for *storing* knowledge, but terrible for *capturing* quick thoughts (too much friction).
- They are also weak at *executing* on what you capture, leading to "digital hoarding" (passive accumulation).

## ✅ The Solution: FOKUS
1. **⚡ Capture** - Frictionless input from anywhere (PWA, share target).
2. **🤖 Process** - AI automatically categorizes items (Article, Video, Task, Idea).
3. **🎯 Execute** - Built-in tools to consume content or complete tasks immediately.
4. **📤 Export** - Send polished, processed insights to your Second Brain.

---

## ✨ Key Features

### 1. Frictionless Capture & AI Processing
- **Instant Capture**: Just type or paste. No fields, no forms.
- **Auto-Categorization**: AI detects if it's a video to watch, article to read, task to do, or idea to develop.
- **Auto-Tagging**: AI generates relevant tags automatically.

### 2. The Execution Queue (Review)
- **Tinder-style Interface**: Swipe right to **Execute**, left to **Delete**, up to **Archive**.
- **Context-Aware Actions**:
  - **Tasks** → "Complete"
  - **Articles** → "Read" (with built-in reader)
  - **Videos** → "Watch" (with embedded player)
  - **Ideas** → "Process" (with expansion editor)

### 3. Knowledge Retention
- **📝 Notes & Takeaways**: Capture insights *while* you execute/consume.
- **🗄️ Archive**: Completed items are never lost. Searchable archive with full history.
- **🔍 Enhanced Search**: Find items by title, tags, or your personal notes.

### 4. Second Brain Integrations
- **💎 Obsidian Export**: Generates Markdown files with frontmatter, tags, and formatted notes.
- **Notion Export**: Generates CSV files compatible with Notion's import.
- **JSON Backup**: Full data ownership.

---

## 🚀 Workflow

1. **Capture** (10s): Dump an idea or link into FOKUS.
2. **Process** (Auto): AI organizes it into your queue.
3. **Execute** (Focus): When ready, open FOKUS. The queue forces you to decide: Do it now, or delete it.
4. **Annotate**: Add key takeaways in the Notes field.
5. **Export**: Archive the item and send the processed knowledge to your permanent Second Brain.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **State**: Zustand (Local-First, Offline-Ready)
- **AI**: Google Gemini / OpenAI (Configurable)
- **PWA**: Installable on iOS/Android

## 📦 Installation

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd second-brain
   npm install
   ```

2. **Configure AI**
   Copy `.env.example` to `.env` and add your API key:
   ```env
   VITE_GOOGLE_API_KEY=your-gemini-key
   # OR
   VITE_OPENAI_API_KEY=your-openai-key
   ```

3. **Run**
   ```bash
   npm run dev
   ```

## 📚 Documentation
- [Obsidian Integration Guide](./docs/obsidian-integration.md)
- [Notion Integration Guide](./docs/notion-integration.md)

---

**Made with 🧠 by someone who forgets everything.**
