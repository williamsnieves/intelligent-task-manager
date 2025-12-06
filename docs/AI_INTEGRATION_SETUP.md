# AI Integration Setup Guide

This guide explains how to set up and use the AI-powered task analysis feature in the Intelligent Task Manager.

## Overview

The AI integration uses **Ollama** to run open-source LLMs locally, providing smart suggestions for:
- **Task Priority** (LOW, MEDIUM, HIGH, URGENT)
- **Due Date** (based on task description)
- **Reasoning** (explanation for the suggestions)

**Why Ollama?**
- ✅ **100% Privacy**: All data stays on your machine
- ✅ **No API Costs**: Completely free to use
- ✅ **Offline**: Works without internet connection
- ✅ **Open Source**: Transparent and community-driven

## Setup

### 1. Install Ollama

Ollama allows you to run powerful open-source LLMs locally on your machine.

**Installation Steps**:

1. Visit [https://ollama.com/](https://ollama.com/)
2. Download and install for your OS (macOS, Linux, Windows)

### 2. Download a Model

Choose one of these recommended open-source models:
   ```bash
   # Mistral 7B (Best balance, ~4GB)
   ollama pull mistral

   # OR Phi-3 Mini (Fastest, ~2.3GB)
   ollama pull phi3

   # OR Llama 2 7B (Alternative, ~3.8GB)
   ollama pull llama2

   # OR Vicuna 7B (Chat-optimized, ~3.8GB)
   ollama pull vicuna
   ```

### 3. Verify Installation

```bash
ollama list
```
You should see your downloaded models.

### 4. Backend Configuration

Create or update `backend/.env`:

```env
# AI Configuration (Ollama)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral
```

**That's it!** Ollama will run automatically in the background.

## Usage

### Frontend

1. **Create a New Task**:
   - Click "+ Add Task" button
   - Enter a task title and description

2. **Get AI Suggestions**:
   - Click the "AI Suggest Priority & Date" button (with sparkles icon ✨)
   - Wait for the AI to analyze your task description
   - The Priority and Due Date fields will auto-populate with suggestions

3. **Review and Adjust**:
   - Review the AI suggestions
   - Modify if needed
   - Submit the task

### Backend API

#### Analyze Task
```http
POST /ai/analyze
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "description": "Implement user authentication with JWT and refresh tokens"
}
```

**Response**:
```json
{
  "priority": "HIGH",
  "dueDate": "2025-12-20",
  "reasoning": "Authentication is a critical security feature that should be prioritized. Given the complexity of implementing JWT with refresh tokens, a reasonable timeline is 2 weeks."
}
```

#### Check AI Health
```http
GET /ai/health
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "available": true,
  "provider": "ollama"
}
```

## Troubleshooting

### "Ollama is not running"

- Ensure Ollama is running: `ollama list`
- Check if the model is downloaded: `ollama pull mistral`
- Verify `OLLAMA_HOST` in `.env` is correct (default: `http://localhost:11434`)
- On macOS/Linux, Ollama runs as a background service after installation
- On Windows, ensure the Ollama app is running in the system tray

### Slow Response Times

- Use a smaller model like `phi3` (faster but slightly less accurate)
- Ensure your machine meets minimum requirements (8GB RAM recommended)
- Close other resource-intensive applications
- Consider upgrading RAM if consistently slow

### Inaccurate Suggestions

- Provide more detailed task descriptions
- Include context like urgency, dependencies, or complexity
- You can always manually adjust the AI suggestions

## Model Comparison

All models run locally and are 100% private:

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **Mistral 7B** | ~4GB | Medium | High | ⭐ Recommended - Best balance |
| **Phi-3 Mini** | ~2.3GB | Fast | Good | Low-end hardware, speed priority |
| **Llama 2 7B** | ~3.8GB | Medium | High | Alternative to Mistral |
| **Vicuna 7B** | ~3.8GB | Medium | High | Chat-optimized tasks |

## Best Practices

1. **Write Clear Descriptions**: The AI analyzes the task description, so be specific.
   - ❌ Bad: "Fix bug"
   - ✅ Good: "Fix login page redirect bug where users are sent to 404 after successful authentication"

2. **Review Suggestions**: AI suggestions are helpful but not perfect. Always review before submitting.

3. **Your Data is Private**: All AI processing happens locally on your machine. No data is sent to external servers.

4. **Optimize for Your Hardware**:
   - 8GB RAM: Use `phi3`
   - 16GB+ RAM: Use `mistral` or `llama2`

## Development

### Adding a New AI Provider

1. Create a new provider class implementing `IAiProvider` interface in `backend/src/modules/ai/infrastructure/`
2. Register the provider in `AiService` constructor
3. Update `.env` configuration options

### Testing

```bash
# Backend unit tests
cd backend
pnpm test src/modules/ai

# Manual testing with curl
curl -X POST http://localhost:3000/ai/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Implement dark mode toggle"}'
```

## Security & Privacy

- **100% Local Processing**: All AI analysis happens on your machine. No data leaves your computer.
- **No API Keys Required**: Unlike cloud AI services, Ollama doesn't require API keys or accounts.
- **Rate Limiting**: The AI endpoint is protected by JWT authentication to prevent abuse.
- **Input Validation**: Task descriptions are validated and sanitized before processing.
- **Open Source**: Both Ollama and the models are open source and auditable.

## Resources

- [Ollama Official Website](https://ollama.com/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Ollama Model Library](https://ollama.com/library)
- [Mistral AI](https://mistral.ai/)
- [Microsoft Phi-3](https://azure.microsoft.com/en-us/products/phi-3)
- [Meta Llama 2](https://llama.meta.com/)

