# Task 02: Database Design & Schema Implementation

## Goal
Design and implement the MongoDB data models using Mongoose within the NestJS backend, adhering to DDD principles.

## Context
- **Data Model**: As defined in the PRD (Section 8).
- **Library**: `@nestjs/mongoose` and `mongoose`.
- **Architecture**: Schemas belong to the Infrastructure layer of their respective modules.

## Steps

### 1. Install Dependencies
- [ ] In `backend/`, install: `npm install @nestjs/mongoose mongoose`.

### 2. Database Module
- [ ] Create `src/modules/database/database.module.ts` to handle Mongoose connection using `ConfigService`.
- [ ] Import `DatabaseModule` in `AppModule`.

### 3. Define Schemas (DDD/Module approach)
Create the following schemas in `src/modules/<module>/infrastructure/schemas/`.

#### User Schema (`src/modules/users/infrastructure/schemas/user.schema.ts`)
- [ ] Fields:
  - `email` (string, unique, required, index)
  - `passwordHash` (string, required)
  - `name` (string, required)
  - `createdAt` (Date, default: now)

#### Project Schema (`src/modules/projects/infrastructure/schemas/project.schema.ts`)
- [ ] Fields:
  - `name` (string, required)
  - `color` (string, default: hex)
  - `userId` (ObjectId, ref: 'User', required, index)
  - `createdAt` (Date)

#### Label Schema (`src/modules/labels/infrastructure/schemas/label.schema.ts`)
- [ ] Fields:
  - `name` (string, required)
  - `color` (string)
  - `userId` (ObjectId, ref: 'User')

#### Task Schema (`src/modules/tasks/infrastructure/schemas/task.schema.ts`)
- [ ] Fields:
  - `title` (string, required)
  - `description` (string)
  - `status` (enum: 'TODO', 'IN_PROGRESS', 'DONE', default: 'TODO')
  - `priority` (enum: 'LOW', 'MEDIUM', 'HIGH', 'URGENT')
  - `dueDate` (Date)
  - `projectId` (ObjectId, ref: 'Project')
  - `labels` (Array of ObjectId, ref: 'Label')
  - `aiSuggestedPriority` (string, optional)
  - `aiSuggestedDueDate` (Date, optional)
  - `userId` (ObjectId, ref: 'User', required) - *Crucial for security*
  - `createdAt` (Date)

### 4. Model Injection
- [ ] Register schemas in `MongooseModule.forFeature()` within `UsersModule`, `ProjectsModule`, `TasksModule`.

## Verification
- [ ] Application starts without schema errors.
- [ ] Schemas are correctly located in `infrastructure` folders.
