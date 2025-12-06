# Task 08: AI Integration & Smart Prioritization

## Goal
Integrate an AI service to analyze task descriptions and suggest Priority, Due Dates, Titles, and Descriptions using **open-source LLMs**.

## Context
- **Backend**: `src/modules/ai/` (DDD Architecture).
- **Frontend**: `src/features/ai/` (Vertical Slicing).
- **LLM Strategy**: **Ollama only** (100% local, privacy-first, no API costs).
- **Recommended Local Models**:
  - **Mistral 7B**: Best balance of performance and efficiency (default).
  - **Phi-3 Mini (3.8B)**: Ultra-fast, ideal for lower-end hardware.
  - **Llama 2 7B / Vicuna 7B**: Solid alternatives for chat/instruct.

## Steps

### 1. Backend AI Module (`src/modules/ai/`)
- [x] Create `AiModule` and `AiService` (DDD structure).
- [x] Define `IAiProvider` interface with `analyzeTask()` and `isAvailable()`.
- [x] Implement `OllamaProvider` to connect to local instance (default: `http://localhost:11434`).
  - Uses `mistral` as default model (configurable via `OLLAMA_MODEL`).
- [x] Implement `analyzeTask(description, currentTitle?)`:
  - Multilingual prompt with automatic language detection.
  - Returns: priority, dueDate, reasoning, titleSuggestions (2-3), descriptionSuggestions (2-3).
- [x] Endpoint: `POST /ai/analyze` (protected with JWT).
- [x] Endpoint: `GET /ai/health` (check Ollama availability).

### 2. Frontend Integration (`src/features/ai/`)
- [x] **Component**: `AiSuggestButton` with loading states and error handling.
- [x] **Component**: `AiSuggestions` with selectable cards for titles and descriptions.
- [x] **Integration**: Added to `CreateTaskModal` with:
  - Auto-apply priority and due date.
  - Interactive selection of AI-suggested titles (2-3 options).
  - Interactive selection of AI-suggested descriptions (2-3 options).
  - Visual feedback with gradient design (purple/pink).
- [x] **Modal UX**: Fixed scroll behavior with sticky header/footer.

### 3. Multilingual Support
- [x] Automatic language detection from user input.
- [x] AI responds in the same language as the user (Spanish, English, etc.).
- [x] All suggestions (titles, descriptions, reasoning) in user's language.

### 4. Documentation
- [x] Created comprehensive `docs/AI_INTEGRATION_SETUP.md` with:
  - Installation guide for Ollama.
  - Model comparison and recommendations.
  - Configuration examples.
  - Troubleshooting section.
  - Best practices for writing task descriptions.

## Verification
- [x] AI Endpoint returns valid JSON from Local LLM (Ollama).
- [x] Frontend button populates priority and due date automatically.
- [x] Title and description suggestions appear in selectable cards.
- [x] Selecting a suggestion updates the form fields.
- [x] Multilingual support works (tested with Spanish and English).
- [x] Modal is fully scrollable with fixed header/footer.
- [x] Error handling works when Ollama is offline.
- [x] Health check endpoint confirms Ollama availability.
