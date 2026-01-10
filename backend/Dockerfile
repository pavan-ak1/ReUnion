# -------------------------
# 1️⃣ Builder Stage (Install deps + Build TS)
# -------------------------
FROM node:20 AS builder
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install ONLY required dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm run build



# -------------------------
# 2️⃣ Runner Stage (Production)
# -------------------------
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies (smaller image)
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy compiled output
COPY --from=builder /app/dist ./dist


EXPOSE 5000

# Start server
CMD ["node", "dist/index.js"]
