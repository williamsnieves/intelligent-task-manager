# Task 07.2: Testing Strategy (Playwright & Unit)

## Goal
Establish a robust testing strategy ensuring critical user flows work as expected through End-to-End (E2E) testing with Playwright, and verifying backend logic with Unit Tests.

## Prerequisites
- [x] Task 07.1 (Code Quality) completed (Lint/Build passing).
- [ ] Backend running locally.
- [ ] Frontend running locally.

## Steps

### 1. Playwright Setup (E2E)
- [x] Install Playwright in `frontend` directory: `pnpm create playwright`.
- [x] Configure `playwright.config.ts`:
    - Base URL: `http://localhost:5173` (Vite default).
    - Browsers: Chromium, Firefox, WebKit.
    - Screenshot on failure.
    - Headless mode for CI, Headed for local debug.

### 2. Critical Flow Tests
Create `tests/critical-flow.spec.ts` covering:
- [x] **Auth Flow**:
    - Register a new user.
    - Login with valid credentials.
    - Verify redirection to dashboard.
    - Logout.
- [x] **Project Flow**:
    - Create a new project.
    - Verify project appears in sidebar.
    - Select project.
- [x] **Task Flow**:
    - Create a task within a project.
    - Verify task appears in list.
    - Change task status (Todo -> In Progress -> Done).
    - Delete task.

### 3. Backend Unit Tests (Jest)
- [x] Review existing `*.spec.ts` files in Backend.
- [x] Ensure `AuthService` has unit tests for:
    - `validateUser` (success/failure).
    - `login` (returns JWT).
- [x] Ensure `TasksService` has unit tests for:
    - `create` (associated to user/project).
    - `findAll` (filters working).

## Deliverables
- [x] Playwright configuration file.
- [x] E2E Test Suite for Critical Path.
- [x] Unit Test Report for Backend (`pnpm test`).
- [ ] Video/Trace of passing E2E tests.

