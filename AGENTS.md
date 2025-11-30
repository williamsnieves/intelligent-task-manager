# AGENTS.md - Intelligent Task Manager

This file outlines the architectural rules, coding standards, and best practices for the **Intelligent Task Manager** project. All AI agents and developers must adhere to these guidelines to ensure consistency, scalability, and maintainability.

## 1. Global Principles
- **Context-Awareness**: Always reference this file (`AGENTS.md`) and the PRD (`docs/PRD_Intelligent_Task_Manager.md`) before making decisions.
- **SOLID**: Apply SOLID principles to all class and component designs.
- **DRY (Don't Repeat Yourself)**: Abstract common logic into shared utilities or hooks, but avoid premature abstraction (Rule of Three).
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable solutions over complex over-engineered ones.
- **POLA (Principle of Least Astonishment)**: Code should behave in a way that most users (and developers) expect.
- **Vertical Slicing**: Organize code by **Feature** first, then by **Layer**. (See Frontend/Backend sections).

## 2. Backend Rules (NestJS + MongoDB)

### Architecture: Domain-Driven Design (DDD) with Modular Monolith
- **Modules**: Organize `src/` into distinct modules based on business domains (e.g., `Auth`, `Projects`, `Tasks`).
- **Layers per Module**:
  - `domain/`: Entities and Interfaces (Pure TS, no framework dependencies if possible).
  - `dto/`: Data Transfer Objects with `class-validator`.
  - `infrastructure/`: Mongoose schemas and repositories.
  - `application/`: Services/Use-Cases implementing business logic.
  - `interface/`: Controllers (HTTP) and Resolvers (GraphQL).

### Validation & Error Handling
- **DTOs**: strictly use DTOs for all Inputs/Outputs.
- **Validation**: Use `class-validator` decorators (`@IsString`, `@IsEmail`, `@IsOptional`) in DTOs.
- **Pipes**: Enable global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` to strip/reject unknown properties.
- **Exceptions**: Use NestJS standard `HttpException` or custom domain exceptions. Do not leak internal errors (stack traces) to the client in production.

### Database (Mongoose)
- **Schemas**: Define strict Mongoose schemas. Use `@nestjs/mongoose` decorators.
- **Indexes**: Explicitly define indexes for frequently queried fields (e.g., `userId`, `projectId`, `status`).
- **Performance**: Use `.lean()` for read-only queries to avoid hydration overhead.
- **Injection**: Inject Models into Services, never into Controllers.

## 3. Frontend Rules (React + Vite + Tailwind)

### Architecture: Screaming Architecture + Vertical Slicing
- **Directory Structure**:
  ```
  src/
    features/          # Vertical Slices (Business Domains)
      auth/
        components/    # Components specific to Auth
        hooks/         # Hooks specific to Auth
        services/      # API calls specific to Auth
        store/         # State (Zustand) specific to Auth
        types/         # TS Types specific to Auth
        index.ts       # Public API of the feature
      projects/
      tasks/
    components/        # Shared UI Components (Buttons, Inputs) - Atomic Design
    hooks/             # Shared Hooks (useDebounce, useTheme)
    lib/               # 3rd party library wrappers (Axios, formatting)
    layout/            # Application layouts
  ```
- **Feature Isolation**: A feature should "own" its logic. Imports between features should be minimized or done via the public `index.ts`.

### State Management (Zustand)
- **Stores**: Create small, feature-specific stores (e.g., `useTaskStore`, `useAuthStore`) rather than one giant global store.
- **Selectors**: Use selectors to access specific parts of the state to optimize re-renders.

### Styling (Tailwind CSS)
- **Utility-First**: Use utility classes directly in JSX.
- **No @apply**: Avoid `@apply` in CSS files unless creating a highly reusable base component (e.g., `.btn`).
- **Tokens**: Use `tailwind.config.js` for colors, spacing, and fonts to maintain consistency.

## 4. Security Rules (OWASP Top 10)
- **Authentication**:
  - Use **JWT** (stateless) for API authentication.
  - Store tokens securely (HttpOnly cookies preferred, or short-lived access tokens in memory + refresh tokens). *For MVP, localStorage is acceptable if XSS risks are mitigated, but flag as tech debt.*
- **Authorization**:
  - **RBAC/Owner**: Always verify `userId` on data access. A user must ONLY see/edit their own tasks.
- **Input Sanitization**:
  - **Backend**: `ValidationPipe` strips unknown fields.
  - **Frontend**: React automatically escapes content to prevent XSS. Avoid `dangerouslySetInnerHTML`.
- **Headers**: Use `helmet` in NestJS to set security headers (HSTS, X-Frame-Options, etc.).
- **Rate Limiting**: Implement `nestjs-throttler` to prevent brute-force attacks on login/register endpoints.

## 5. DevOps & Deployment
- **Docker**:
  - Use multi-stage builds to keep images small (build vs run stages).
  - Run as non-root user (`USER node`) inside containers.
- **CI/CD**:
  - **Lint & Test**: Run on every PR.
  - **Build**: Ensure `npm run build` passes before merge.

## 6. Testing
- **Backend**:
  - Unit Tests (`*.spec.ts`) for Services (mock repositories).
  - E2E Tests for Controllers (using `@nestjs/testing` + Supertest).
- **Frontend**:
  - Unit Tests (Vitest) for utils and hooks.
  - Component Tests (Testing Library) for complex UI interaction.

