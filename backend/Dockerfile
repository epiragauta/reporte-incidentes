# ----- Build stage -----
FROM node:22-alpine AS build

WORKDIR /app

# Install build dependencies for sqlite3 native module
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ----- Production stage -----
FROM node:22-alpine

WORKDIR /app

# sqlite3 native addon needs these at runtime
RUN apk add --no-cache libstdc++

COPY --from=build /app/node_modules ./node_modules
COPY . .

# Remove dev/test files that shouldn't be in the image
RUN rm -f incidents.db server.log

# Data directory for SQLite persistence (mount a volume here)
RUN mkdir -p /data
ENV DATABASE_PATH=/data/incidents.db

EXPOSE 3000

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app /data
USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/incidents?hours=1 || exit 1

CMD ["node", "server.js"]
