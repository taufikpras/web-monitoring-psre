#!/bin/sh

# Entrypoint script to inject environment variables into config.js at runtime

# Default API URL if not provided
API_BASE_URL=${API_BASE_URL:-/api}

echo "Injecting runtime configuration..."
echo "API_BASE_URL: $API_BASE_URL"

# Replace placeholder in config.js with actual environment variable
sed -i "s|__API_BASE_URL__|$API_BASE_URL|g" /usr/share/nginx/html/config.js

echo "Configuration injected successfully!"

# Start nginx
exec nginx -g 'daemon off;'
