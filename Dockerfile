# Multi-Stage Production Dockerfile for ERIC Robotics — Insight.IO Dashboard

# Stage 1: Build the Vite production bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (including optional dev dependencies required for build)
RUN npm ci

# Copy full application source code
COPY . .

# Run production build (TypeScript check + Vite production bundle)
RUN npm run build

# Stage 2: High-performance Nginx static web server
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and asset caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
