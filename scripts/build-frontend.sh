#!/bin/bash
# Script to build frontend SSR Docker images
# Usage: ./scripts/build-frontend.sh [service]
# Examples:
#   ./scripts/build-frontend.sh              # Build all
#   ./scripts/build-frontend.sh auth-ssr     # Build specific service

set -e

FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SERVICES=("auth-ssr" "delivery-ssr" "restaurant-ssr")

if [ -n "$1" ]; then
    SERVICES=("$1")
fi

for SERVICE in "${SERVICES[@]}"; do
    echo "Building $SERVICE..."
    docker build \
        --build-arg SERVICE_NAME="$SERVICE" \
        -t "$SERVICE:latest" \
        -f "$FRONTEND_DIR/Dockerfile" \
        "$FRONTEND_DIR"
    echo "$SERVICE built successfully"
done

echo "All frontend services built"
