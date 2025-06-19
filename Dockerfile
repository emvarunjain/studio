# Stage 1: Install dependencies and build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json ./
COPY package-lock.json ./
# If using yarn, uncomment below and comment out npm ci
# COPY yarn.lock ./

# Install dependencies
RUN npm ci
# If using yarn, uncomment below and comment out npm ci
# RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Copy .env.production or ensure environment variables are set during runtime
# For build-time env vars needed by Next.js (NEXT_PUBLIC_*), ensure they are available here
# Example: ARG NEXT_PUBLIC_FIREBASE_API_KEY
# ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
# Add all NEXT_PUBLIC_ variables that are needed at build time

# Build the Next.js application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
# If you have a custom server, copy that too. For default Next.js server, this is not needed.
# COPY --from=builder /app/server.js ./server.js

# Install production dependencies (if any, usually Next.js handles this)
# If your package.json has separate devDependencies, you might optimize this.
# For simplicity, we can reinstall, but a better approach is to copy node_modules from builder if possible.
# This example uses a minimal approach suitable for standard Next.js apps.
# Next.js standalone output is often preferred for smaller images.
# Consider `output: 'standalone'` in next.config.ts for optimization.
# If using standalone output, the COPY commands would be different.

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
# By default, Next.js uses 'next start'. If you have a custom server, adjust this.
CMD ["npm", "run", "start", "-p", "3000"]

# Healthcheck (optional, but good practice)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1
