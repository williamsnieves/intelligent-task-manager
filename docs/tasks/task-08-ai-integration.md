# Task 08: AI Integration & Smart Prioritization

## Goal
Integrate an AI service to analyze task descriptions and suggest Priority and Due Dates.

## Context
- **Backend**: `src/modules/ai/`.
- **Frontend**: `src/features/tasks/components/AiSuggestButton.tsx`.

## Steps

### 1. Backend AI Module (`src/modules/ai/`)
- [ ] Create `AiModule` and `AiService`.
- [ ] Implement `analyzeTask(description)`: Call OpenAI/LLM API.
- [ ] Endpoint: `POST /ai/analyze`.

### 2. Frontend Integration (`src/features/tasks/`)
- [ ] **Component**: `AiSuggestButton` inside `CreateTaskModal`.
- [ ] **Logic**:
  - On click, call API.
  - On success, update form state (Priority, Due Date).

## Verification
- [ ] AI Endpoint returns valid JSON.
- [ ] Frontend button populates form fields correctly.
