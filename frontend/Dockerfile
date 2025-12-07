# ================================
# Multi-stage Dockerfile for React Frontend
# Optimized for production deployment with nginx
# ================================

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# ================================
# Stage 2: Builder
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN pnpm run build

# ================================
# Stage 3: Production with nginx
FROM nginx:1.25-alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck script
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD /healthcheck.sh

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
