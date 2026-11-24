# ==============================================================================
# WORKZEN — Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Dependency resolution
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build frontend & backend assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Minimal production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5050

# Security: Run as non-root user
USER node

# Copy package manifests and production dependencies
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

# Copy compiled build artifacts
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 5050 3070

# Built-in Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5050/api/v1/health || exit 1

CMD ["node", "dist/server/server/index.js"]
