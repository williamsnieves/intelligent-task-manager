# Task 05: Frontend Setup & Architecture

## Goal
Configure the React application with necessary libraries, global state management, and styling, following **Screaming Architecture** and **Vertical Slicing**.

## Context
- **Styling**: Tailwind CSS.
- **State**: Zustand (Feature-based stores).
- **Routing**: React Router DOM.
- **HTTP**: Axios.

## Steps

### 1. Tailwind CSS
- [ ] Install Tailwind CSS, PostCSS, Autoprefixer.
- [ ] Configure `tailwind.config.js` with design tokens (colors, fonts).
- [ ] Add `@tailwind` directives.

### 2. Architecture Structure
- [ ] Create directory structure:
  ```
  src/
    features/
    components/ (shared)
    hooks/ (shared)
    lib/ (axios, utils)
    routes/
  ```

### 3. API Client (`src/lib/axios.ts`)
- [ ] Configure Axios instance with Base URL.
- [ ] Add interceptors for Auth Token (Request) and 401 handling (Response).

### 4. State Management Setup
- [ ] Install `zustand`.
- [ ] (Stores will be created inside `src/features/<feature>/store/` in subsequent tasks).

### 5. Routing Setup
- [ ] Install `react-router-dom`.
- [ ] Create `src/routes/AppRoutes.tsx`.
- [ ] Define `AuthLayout` and `DashboardLayout`.

## Verification
- [ ] Directory structure is created.
- [ ] Tailwind is working.
- [ ] Axios instance is configured.
