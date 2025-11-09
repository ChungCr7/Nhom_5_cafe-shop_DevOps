# --- Build stage ---
FROM node:18-alpine AS builder
WORKDIR /app

# Create non-root user for build
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY --chown=nodejs:nodejs . .

# Build application as non-root
USER nodejs
RUN npm run build

# --- Serve stage ---
FROM nginx:alpine

# Install security updates and tools
RUN apk update && apk upgrade && \
    apk add --no-cache openssl wget && \
    rm -rf /var/cache/apk/*

# Create SSL directory with proper permissions
RUN mkdir -p /etc/nginx/ssl && \
    chmod 755 /etc/nginx/ssl

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config and unnecessary files
RUN rm -f /etc/nginx/conf.d/default.conf.bak && \
    rm -f /docker-entrypoint.d/*.sh

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod 644 /etc/nginx/conf.d/default.conf && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Security: Remove unnecessary packages after setup
RUN apk del wget 2>/dev/null || true

# Expose ports (nginx needs root for ports < 1024, but worker processes run as nginx user)
EXPOSE 80 443

# Health check (nginx image có sẵn wget)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ 2>/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
