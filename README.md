# MakeAPlan CLI 🚀

Transform your product ideas into comprehensive technical specifications using AI-guided discovery.

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue" alt="TypeScript">
</p>

## ✨ Features

- **AI-Powered Discovery**: Leverages Claude or Gemini AI to ask targeted questions about your product idea
- **Structured Workflow**: Three rounds of increasingly specific questions to refine your vision
- **Technical Specifications**: Generates comprehensive documentation including architecture, features, and implementation details
- **File Structure Generation**: Creates an optimal project structure with all necessary files and directories
- **Session Management**: Save and resume sessions, never lose your progress
- **Beautiful CLI**: Intuitive interface with colors, progress indicators, and clear navigation
- **Export Options**: Export to Markdown or JSON for easy sharing and processing

## 🎯 How It Works

1. **Initial Idea**: Start with your product concept
2. **Discovery Questions**: Answer 3 rounds of AI-generated multiple-choice questions
   - Round 1: General requirements and audience
   - Round 2: User experience and differentiation  
   - Round 3: Technical implementation details
3. **Technical Specification**: AI generates a comprehensive technical document
4. **File Structure**: Creates an optimal project structure
5. **Export**: Save as Markdown or JSON for your team

## 📦 Installation

```bash
npm install -g makeaplan

# Or run directly with npx
npx makeaplan
```

## 🚀 Quick Start

```bash
# Start interactive mode
makeaplan

# Start with an idea
makeaplan new --idea "AI-powered recipe manager"

# Resume a session
makeaplan resume

# List all sessions
makeaplan list
```

## 📖 Commands

### `makeaplan new`
Start a new product specification session.

Options:
- `-i, --idea <idea>` - Start with a predefined idea
- `-s, --skip-questions` - Use default configuration

### `makeaplan resume`
Resume a previous session from where you left off.

### `makeaplan list`
Display all your sessions with their status and last update time.

### `makeaplan export [sessionId]`
Export a session to markdown or JSON format.

Options:
- `-f, --format <format>` - Export format: `markdown`, `json`, or `both`

### `makeaplan clean`
Remove old sessions to free up space.

Options:
- `-d, --days <days>` - Keep sessions newer than this many days (default: 30)
- `-f, --force` - Skip confirmation prompt

### `makeaplan config [action]`
Manage configuration and API keys.

Actions:
- `reset` - Reset all settings to defaults
- `keys` - Manage API keys

## ⚙️ Configuration

### API Keys

Set your API keys as environment variables:

```bash
export ANTHROPIC_API_KEY=your_key_here
export GEMINI_API_KEY=your_key_here
```

Or let the CLI prompt you and save them securely.

### Session Options

During setup, you can configure:
- **Number of questions per round** (2-8 for first round, 2-6 for subsequent)
- **Answer choices per question** (2-6 options)
- **AI provider** (Anthropic Claude or Google Gemini)

## 📁 Output Example

### Generated Technical Specification
```markdown
# AI-Powered Recipe Manager

## Executive Summary
A modern recipe management platform that uses AI to suggest recipes based on available ingredients...

## Core Features
1. Ingredient Recognition
2. Recipe Suggestions
3. Meal Planning
...
```

### Generated File Structure
```
recipe-manager/
├── src/
│   ├── components/
│   │   ├── RecipeCard.tsx
│   │   ├── IngredientScanner.tsx
│   │   └── MealPlanner.tsx
│   ├── services/
│   │   ├── ai-service.ts
│   │   └── recipe-api.ts
│   └── pages/
│       ├── index.tsx
│       └── recipes/[id].tsx
├── package.json
└── README.md
```

## 🔒 Privacy & Security

- API keys are stored locally in your system's config directory
- Sessions are saved locally in `~/.makeaplan/sessions/`
- No data is sent to external servers except AI API calls
- You can clear all data with `makeaplan config reset`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/) - Interactive prompts
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) - Claude AI
- [Google Generative AI](https://github.com/google/generative-ai-js) - Gemini AI

---

<p align="center">Made with ❤️ by developers, for developers</p>