# FOKUS - Focus on the What. Decide the When. ✨

A frictionless second brain app designed for INTP/ADHD users. Capture thoughts instantly, let AI organize them, and execute when ready.

![FOKUS Banner](https://img.shields.io/badge/PWA-Ready-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6) ![React](https://img.shields.io/badge/React-19-61DAFB)

## 🧠 Features

### Core Workflow
- **⚡ Quick Capture**: Instantly save ideas, articles, videos, and tasks
- **🤖 AI Processing**: Automatic categorization and tagging using GPT-4o or GPT-4o-mini
- **🎴 Card Stack Review**: Swipe through items with intuitive gestures
- **🎯 Execute Mode**: Focus on one task at a time with built-in Pomodoro timer

### Built-In Tools
- **📺 Video Player**: Embedded YouTube/Vimeo playback
- **📄 Article Reader**: Read and annotate articles
- **⏱️ Pomodoro Timer**: 25-minute focus sessions for tasks
- **💭 Idea Expansion**: Dedicated space to develop thoughts

### Smart Features
- **🔥 Streak Tracking**: Build daily habits
- **🏷️ Auto-Tagging**: AI generates relevant tags
- **💾 Data Export/Import**: Full control over your data
- **📱 PWA**: Install as a native app on any device
- **🔄 Offline Support**: Works without internet

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd second-brain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your-api-key-here
   ```
   
   Get an API key from: https://platform.openai.com/api-keys

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📱 Usage

### Capturing
1. Type or paste anything into the input box on the home page
2. AI automatically categorizes it (article, video, idea, or task)
3. Items are queued for review

### Reviewing
1. Go to the Review page
2. **Swipe right** or press **Space** to execute an item
3. **Swipe left** or press **Delete** to discard
4. **Swipe up** to save for later

### Keyboard Shortcuts
- **Space**: Execute current item
- **Delete/Backspace**: Delete current item
- **Arrow Up**: Save for later
- **Escape**: Close modals

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand with localStorage persistence
- **Animations**: Framer Motion
- **AI**: OpenAI API (GPT-4o / GPT-4o-mini)
- **Build**: Vite
- **PWA**: vite-plugin-pwa

## 📦 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎨 Customization

### AI Mode
Toggle between:
- **Real AI**: Uses OpenAI GPT models (requires API key)
- **Mock AI**: Rule-based categorization (no API key needed)

Configure in **Settings** → **AI Configuration**

### Animation Speed
Adjust card animations speed: Slow / Normal / Fast

## 💾 Data Management

### Export
Settings → Data Management → Export Data

Creates a JSON backup of:
- All captured items
- Settings
- Statistics

### Import
Settings → Data Management → Import Tasks

Supports multiple formats:
- Plain text (one per line)
- CSV
- JSON
- Markdown checklists

## 🔒 Privacy & Security

- **Local First**: All data stored in browser localStorage
- **No Tracking**: Zero analytics or tracking
- **API Key**: Stored locally, never sent to our servers
- **Open Source**: Full transparency

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🙏 Acknowledgments

Built for fellow ADHD/INTP thinkers who need to capture everything but execute strategically.

---

**Made with 🧠 by someone who forgets everything**
