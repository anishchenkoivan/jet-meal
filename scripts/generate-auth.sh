#!/bin/bash
# Script to generate htpasswd for monitoring auth
# Usage: ./scripts/generate-auth.sh

set -e

NAMESPACE="${NAMESPACE:-monitoring}"
USER="${USER:-admin}"
PASSWORD="${PASSWORD:-prompassword}"

if ! command -v htpasswd &> /dev/null; then
    echo "htpasswd not found, installing apache2-utils..."
    apt-get update && apt-get install -y apache2-utils
fi

HASH=$(htpasswd -nb "$USER" "$PASSWORD" | base64)
echo "Generated htpasswd hash: $HASH"

kubectl create secret generic monitoring-htpasswd \
    --namespace="$NAMESPACE" \
    --from-literal=auth="$HASH" \
    --dry-run=client -o yaml | kubectl apply -f -

echo "Secret created in namespace $NAMESPACE"
echo "User: $USER"
echo "Password: $PASSWORD"
