# Task 01: Project Initialization & Infrastructure Setup

## Goal
Initialize the monorepo structure, set up the backend (NestJS) and frontend (React + Vite) projects, and configure the local development environment with Docker for MongoDB.

## Context
- **Architecture**: Monorepo (Client/Server) or separate folders. We will use a simple structure with `frontend/` and `backend/` in the root.
- **Tech Stack**: NestJS (Backend), React + Vite (Frontend), MongoDB (Database), Docker Compose (Local Dev DB).

## Steps

### 1. Repository Structure
- [ ] Create root directory `intelligent-task-manager`.
- [ ] Initialize git repository.
- [ ] Create `.gitignore` (standard Node/React/Nest templates).

### 2. Backend Setup (NestJS)
- [ ] Install Nest CLI globally (if not present) or use `npx`.
- [ ] Generate backend project: `nest new backend --package-manager npm`.
- [ ] Clean up default boilerplate (AppController, AppService).
- [ ] Verify backend runs on `http://localhost:3000`.

### 3. Frontend Setup (React + Vite)
- [ ] Generate frontend project: `npm create vite@latest frontend -- --template react-ts`.
- [ ] Install dependencies: `cd frontend && npm install`.
- [ ] Verify frontend runs on `http://localhost:5173`.

### 4. Docker Environment (MongoDB)
- [ ] Create `docker-compose.yml` in the root.
- [ ] Add service `mongo`:
  - Image: `mongo:latest` (or specific version e.g., 6.0).
  - Ports: `27017:27017`.
  - Volumes: `./mongo-data:/data/db`.
  - Environment: `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`.
- [ ] Add `mongo-express` (optional but recommended for easy DB viewing).

### 5. Environment Variables
- [ ] Create `backend/.env`:
  - `DATABASE_URL=mongodb://user:pass@localhost:27017/taskmanager?authSource=admin`
  - `PORT=3000`
- [ ] Create `frontend/.env`:
  - `VITE_API_URL=http://localhost:3000`

## Verification
- [ ] `docker-compose up -d` starts MongoDB successfully.
- [ ] Backend connects to MongoDB (log verification).
- [ ] Frontend starts and renders the default Vite page.

