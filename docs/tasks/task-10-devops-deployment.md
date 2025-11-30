# Task 10: DevOps & Deployment

## Goal
Containerize the application and prepare for deployment to AWS ECS.

## Context
- **Container**: Docker.
- **CI/CD**: GitHub Actions.
- **Cloud**: AWS (ECS Fargate).

## Steps

### 1. Dockerfiles
- [ ] **Backend Dockerfile**:
  - Base: `node:18-alpine`.
  - Build step: `npm run build`.
  - CMD: `npm run start:prod`.
- [ ] **Frontend Dockerfile** (for serving static files or SSR wrapper):
  - Build step: `npm run build`.
  - Serve with `nginx:alpine` or simple node server (`serve -s dist`).

### 2. GitHub Actions (CI)
- [ ] Create `.github/workflows/ci.yml`.
- [ ] Trigger: Push to main.
- [ ] Jobs:
  - Install dependencies.
  - Lint.
  - Test.
  - Build Docker images.

### 3. AWS Deployment Preparation (CD)
- [ ] (Documentation only for this task) Outline steps:
  - Push images to ECR.
  - Update ECS Task Definition with new image tag.
  - Force deployment on ECS Service.

## Verification
- [ ] `docker build` succeeds for both services locally.
- [ ] GitHub Action runs successfully on push.
- [ ] Deployment script (if implemented) triggers ECS update.

