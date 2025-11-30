# Task 06: Frontend Authentication UI

## Goal
Implement the Login and Registration screens using **Vertical Slicing** (`src/features/auth/`).

## Context
- **Location**: `src/features/auth/`.
- **Components**: Login, Register, ProtectedRoute.

## Steps

### 1. Auth Feature Structure
- [ ] Create folders: `src/features/auth/{components, hooks, services, store, types}`.

### 2. Auth Store (`src/features/auth/store/authStore.ts`)
- [ ] Create Zustand store for `user`, `token`, `isAuthenticated`.

### 3. Auth Service (`src/features/auth/services/authService.ts`)
- [ ] Implement `loginAPI` and `registerAPI` calls using Axios.

### 4. Components (`src/features/auth/components/`)
- [ ] **LoginForm**: Controlled inputs, validation, call `useAuthStore`.
- [ ] **RegisterForm**: Controlled inputs, validation.
- [ ] **ProtectedRoute**: Check store, redirect if not authenticated.

### 5. Integration
- [ ] Add routes `/login` and `/register` in `AppRoutes.tsx`.
- [ ] Wrap protected routes with `ProtectedRoute`.

## Verification
- [ ] Can register and login.
- [ ] Token is stored and persists on refresh.
- [ ] Protected routes are inaccessible without login.
