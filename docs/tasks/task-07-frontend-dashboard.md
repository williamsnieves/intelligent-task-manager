# Task 07: Frontend Dashboard & Task Management

## Goal
Build the core user interface: Project sidebar, Task list/board, and creation forms, using **Vertical Slicing**.

## Context
- **Features**: `src/features/projects/`, `src/features/tasks/`.
- **Shared**: `src/layout/DashboardLayout.tsx`.

## Steps

### 1. Projects Feature (`src/features/projects/`)
- [ ] **Store**: `useProjectStore` (list, selectedProject).
- [ ] **Service**: CRUD API calls.
- [ ] **Components**:
  - `ProjectList`: Sidebar list.
  - `CreateProjectModal`.

### 2. Tasks Feature (`src/features/tasks/`)
- [ ] **Store**: `useTaskStore` (tasks, filters).
- [ ] **Service**: CRUD API calls.
- [ ] **Components**:
  - `TaskList`: Main view.
  - `TaskItem`: Individual row/card.
  - `CreateTaskModal`.

### 3. Dashboard Layout
- [ ] Integrate `ProjectList` into Sidebar.
- [ ] Integrate `TaskList` into Main Content area.

### 4. Interactions
- [ ] Selecting a project filters the `TaskList`.
- [ ] Creating a task updates the list optimistically or via re-fetch.

## Verification
- [ ] Full CRUD flow for Projects and Tasks.
- [ ] UI is responsive and follows Tailwind design system.
