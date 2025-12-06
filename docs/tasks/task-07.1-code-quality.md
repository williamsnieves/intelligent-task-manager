# Task 07.1: Code Quality & Build Stability

## Goal
Ensure the codebase is stable, follows coding standards, and builds successfully without errors.

## Context
- **Backend**: NestJS (TypeScript, ESLint, Prettier).
- **Frontend**: React + Vite (TypeScript, ESLint, Prettier).
- **Standard**: 0 Errors (Warnings acceptable but minimized), clean build.

## Steps

### 1. Backend Code Quality
- [ ] Run `pnpm lint` and fix all errors.
- [ ] Run `pnpm format` to ensure style consistency.
- [ ] Run `pnpm build` to verify TypeScript compilation (no emit errors).
- [ ] Verify `tsconfig.json` settings (strict mode).

### 2. Frontend Code Quality
- [ ] Run `pnpm lint` and fix all errors.
- [ ] Run `pnpm format` to ensure style consistency.
- [ ] Run `pnpm build` (Vite) to verify production build.
- [ ] Fix any TypeScript `any` types where easy/possible (or explicitly suppress if strictly necessary).

### 3. Verification
- [ ] `pnpm build` passes in both backend and frontend.
- [ ] No red squigglies in IDE (critical paths).
- [ ] Application starts correctly after build (`node dist/main` for backend, `preview` for frontend).

