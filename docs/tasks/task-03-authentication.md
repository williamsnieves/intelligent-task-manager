# Task 03: Backend Authentication

## Goal
Implement secure user authentication using JWT, Password Hashing, and NestJS Guards, following DDD and Modular Monolith architecture.

## Context
- **Security**: Passwords hashed (bcrypt), API protected (JWT).
- **Module**: `src/modules/auth` and `src/modules/users`.

## Steps

### 1. Install Auth Dependencies
- [ ] `npm install @nestjs/passport passport passport-local passport-jwt @nestjs/jwt bcrypt`
- [ ] `npm install -D @types/passport-local @types/passport-jwt @types/bcrypt`

### 2. Users Service (`src/modules/users/application/users.service.ts`)
- [ ] Implement `create(userDto)` with bcrypt hashing.
- [ ] Implement `findByEmail(email)` for login validation.

### 3. Auth Module Setup (`src/modules/auth/`)
- [ ] Generate `AuthModule`, `AuthService`, `AuthController`.
- [ ] Configure `JwtModule` with secret from `.env` and expiration.

### 4. Strategies (`src/modules/auth/strategies/`)
- [ ] **LocalStrategy**: Validate `email` and `password`.
- [ ] **JwtStrategy**: Extract Bearer token, validate, and return user payload.

### 5. Auth Endpoints (`src/modules/auth/interface/auth.controller.ts`)
- [ ] `POST /auth/register`: Create new user (Use `CreateUserDto`).
- [ ] `POST /auth/login`: Validate credentials, return `{ accessToken }`.

### 6. Guards & Decorators (`src/common/guards/` & `src/common/decorators/`)
- [ ] Implement `JwtAuthGuard`.
- [ ] Create `@CurrentUser()` decorator.

## Verification
- [ ] `POST /auth/register` creates a user.
- [ ] `POST /auth/login` returns JWT.
- [ ] Protected endpoints reject requests without token.
