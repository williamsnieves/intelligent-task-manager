# Task 04: Backend Core CRUD Implementation

## Goal
Implement the core business logic and API endpoints for Projects, Tasks, and Labels, adhering to DDD and Modular architecture.

## Context
- **Pattern**: Controller (Interface) -> Service (Application) -> Repository (Infrastructure).
- **Validation**: Strict DTOs with `class-validator` and Global Pipes.

## Steps

### 1. Global Pipes & Validation
- [ ] Configure `ValidationPipe` in `main.ts` with `whitelist: true` and `forbidNonWhitelisted: true`.

### 2. Projects Module (`src/modules/projects/`)
- [ ] **DTOs** (`dto/`): `CreateProjectDto` (name, color), `UpdateProjectDto`.
- [ ] **Service** (`application/`):
  - `create`, `findAll`, `findOne`, `update`, `remove`.
  - Ensure all methods filter by `userId`.
- [ ] **Controller** (`interface/`):
  - `POST /projects`, `GET /projects`, `PATCH /projects/:id`, `DELETE /projects/:id`.

### 3. Labels Module (`src/modules/labels/`)
- [ ] Follow similar pattern to Projects.

### 4. Tasks Module (`src/modules/tasks/`)
- [ ] **DTOs**: `CreateTaskDto` (title, description, priority, dueDate, projectId, labels[]).
- [ ] **Service**:
  - `create`: Validate project ownership.
  - `findAll`: Support filtering by `projectId`, `status`, `priority`.
  - `update`: Allow status changes, drag-and-drop updates.
- [ ] **Controller**:
  - `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`.

### 5. Cascade Deletion
- [ ] Implement cascade logic (e.g., deleting a project deletes its tasks) via Service logic or Event Emitters.

## Verification
- [ ] CRUD operations work via Postman.
- [ ] User isolation is enforced (User A cannot access User B's data).
- [ ] Invalid payloads are rejected with 400 Bad Request.
