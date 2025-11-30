# Task 08: AI Integration & Smart Prioritization

## Goal
Integrate an AI service to analyze task descriptions and suggest Priority and Due Dates.

## Context
- **Backend**: `src/modules/ai/`.
- **Frontend**: `src/features/tasks/components/AiSuggestButton.tsx`.
- **LLM Strategy**: Support for both external APIs (OpenAI) and **Local LLMs** (via Ollama) for privacy and cost efficiency.
- **Recommended Local Models** (based on research):
  - **Mistral 7B**: Best balance of performance and efficiency.
  - **Phi-3 Mini (3.8B)**: Ultra-fast, ideal for lower-end hardware.
  - **Llama 2 7B / Vicuna 7B**: Solid alternatives for chat/instruct.

## Steps

### 1. Backend AI Module (`src/modules/ai/`)
- [ ] Create `AiModule` and `AiService`.
- [ ] Define `IAiProvider` interface to switch between `OpenAiProvider` and `OllamaProvider`.
- [ ] Implement `OllamaProvider` to connect to local instance (default: `http://localhost:11434`).
  - Use `mistral` or `phi3` as default models.
- [ ] Implement `analyzeTask(description)`:
  - Construct prompt: "Analyze this task: '${desc}'. Suggest priority (LOW, MEDIUM, HIGH, URGENT) and due date (YYYY-MM-DD). Return ONLY JSON."
- [ ] Endpoint: `POST /ai/analyze`.

### 2. Frontend Integration (`src/features/tasks/`)
- [ ] **Component**: `AiSuggestButton` inside `CreateTaskModal`.
- [ ] **Logic**:
  - On click, call API.
  - Show "Analyzing..." state.
  - On success, update form state (Priority, Due Date).
  - Handle errors (e.g., "Local AI not running").

### 3. Local Dev Setup (Ollama)
- [ ] Install [Ollama](https://ollama.com/).
- [ ] Pull recommended model: `ollama pull mistral` or `ollama pull phi3`.
- [ ] Update `.env` to configure `AI_PROVIDER=ollama` and `OLLAMA_HOST`.

## Verification
- [ ] AI Endpoint returns valid JSON from Local LLM.
- [ ] Frontend button populates form fields correctly.
- [ ] Fallback handles if Ollama is offline.
