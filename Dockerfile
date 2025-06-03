# Stage 1: Build React App
FROM node:24-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Build with production environment
RUN npm run build

# Stage 2: Serve via nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make the script executable and ensure proper line endings
RUN chmod +x /docker-entrypoint.sh && \
    sed -i 's/\r$//' /docker-entrypoint.sh

# Create necessary directories with proper permissions
RUN mkdir -p /tmp/nginx && \
    chown -R nginx:nginx /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx && \
    chmod -R g+w /tmp/nginx && \
    chmod -R g+w /var/cache/nginx && \
    chmod -R g+w /etc/nginx && \
    touch /tmp/nginx.pid && \
    chown nginx:nginx /tmp/nginx.pid && \
    chmod g+w /tmp/nginx.pid

# Install envsubst
RUN apk add --no-cache gettext

# Switch to non-root user
USER nginx

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start with our entrypoint script
CMD ["/docker-entrypoint.sh"]
