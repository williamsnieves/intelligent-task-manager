# Task 09: Testing & Quality Assurance

## Goal
Ensure code reliability through Unit Testing and Basic End-to-End (E2E) checks, adhering to **AGENTS.md**.

## Context
- **Backend**: Jest (Unit for Services, E2E for Controllers).
- **Frontend**: Vitest (Unit/Component).

## Steps

### 1. Backend Tests
- [ ] **Unit**: Test `UsersService`, `TasksService` (mock Repositories).
- [ ] **E2E**: Test `AuthModule` flow (Register -> Login).

### 2. Frontend Tests
- [ ] **Unit**: Test `useAuthStore` logic.
- [ ] **Component**: Test `LoginForm` renders and handles submit.
- [ ] **Component**: Test `TaskItem` displays correct data.

### 3. Manual QA
- [ ] Verify all User Stories from PRD.
- [ ] Check Security (Token handling, Redirects).

## Verification
- [ ] `npm run test` passes in Backend.
- [ ] `npm run test` passes in Frontend.
