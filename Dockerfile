# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Update package index and install dumb-init
RUN apk update && apk add --no-cache dumb-init || echo "dumb-init not available, skipping..."

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
# USER node  # Commented out to avoid permission issues in development
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
RUN npm ci --include=dev
COPY . .
RUN npm run build && npm prune --production

# Production stage
FROM base AS production
RUN npm ci --only=production && npm cache clean --force
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --from=build --chown=node:node /usr/src/app/node_modules ./node_modules

# Create non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]
