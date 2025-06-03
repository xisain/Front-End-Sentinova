#!/bin/sh

# Replace environment variables in nginx config
envsubst '${VITE_BACKEND_URL}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp
mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf

# Replace environment variables in JavaScript files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_BACKEND_URL|${VITE_BACKEND_URL}|g" {} +

# Start nginx with debug mode to see more detailed logs
nginx -g "daemon off;" -e /dev/stdout 