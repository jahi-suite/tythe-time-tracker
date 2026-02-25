# Root Dockerfile — for Cloud Run "Deploy from repository" when build context is repo root.
# Builds tt-ts app.
FROM node:20-slim AS builder

WORKDIR /app

COPY tt-ts/package.json tt-ts/package-lock.json ./
RUN npm ci

COPY tt-ts/ .
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

COPY tt-ts/package.json tt-ts/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist-server/server/index.js"]
