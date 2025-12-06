# Task 07.3: CI/CD Pipeline (GitHub Actions)

## Goal
Automate the verification process to ensure no broken code is merged. The pipeline will run Lint, Build, and Tests on every Pull Request.

## Prerequisites
- [x] Task 07.2 (Testing) completed.

## Steps

### 1. GitHub Actions Workflow
Create `.github/workflows/ci.yml` with the following jobs:

#### Job 1: Quality Check
- **Triggers**: Push to `main`, Pull Request to `main`.
- **Steps**:
    - Checkout code.
    - Install pnpm.
    - Install dependencies (Backend & Frontend).
    - **Backend**:
        - `pnpm lint`
        - `pnpm build`
        - `pnpm test` (Unit)
    - **Frontend**:
        - `pnpm lint`
        - `pnpm build`

#### Job 2: E2E Testing (Playwright)
- **Needs**: Quality Check (only run if build passes).
- **Steps**:
    - Checkout code.
    - Install dependencies.
    - Install Playwright Browsers.
    - Start Backend (detached/background).
    - Start Frontend (detached/background).
    - Run Playwright tests (`pnpm exec playwright test`).
    - Upload Artifacts (Screenshots/Traces) on failure.

### 2. Branch Protection Rules (Documentation)
- Document the recommended branch protection rules:
    - Require status checks to pass before merging.
    - Require branches to be up to date before merging.

## Deliverables
- [x] `.github/workflows/ci.yml` file.
- [ ] Successful run of the pipeline on GitHub (screenshot or log).

