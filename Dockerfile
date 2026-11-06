# FarmConnect Production Multi-Stage Container Dockerfile (Phase 31)
FROM node:24-alpine AS base

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy application source
WORKDIR /app
COPY backend ./backend
COPY docs ./docs

# Ensure data directory exists for SQLite WAL mode
RUN mkdir -p /app/backend/data

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "backend/src/server.js"]
