# Multi-stage Dockerfile for Node.js app
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build step placeholder (if using transpilers/build tools)
# RUN npm run build.

FROM node:18-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production deps and app
COPY --from=builder /app /app

ENV NODE_ENV=production
ENV PORT=3000

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
