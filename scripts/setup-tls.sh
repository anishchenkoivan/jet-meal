#!/bin/bash
# Script to setup TLS certificates
# Usage: ./scripts/setup-tls.sh [cert-file] [key-file]

set -e

NAMESPACE="${NAMESPACE:-frontend}"
CERT_FILE="${1:-/home/student/ssl/fullchain.pem}"
KEY_FILE="${2:-/home/student/ssl/privkey.pem}"
SECRET_NAME="jet-meal-tls"

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    echo "Creating TLS secret from files..."
    kubectl create secret tls "$SECRET_NAME" \
        --cert="$CERT_FILE" \
        --key="$KEY_FILE" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    echo "TLS secret created successfully"
else
    echo "SSL files not found at:"
    echo "  Cert: $CERT_FILE"
    echo "  Key: $KEY_FILE"
    echo ""
    echo "Options:"
    echo "1. Provide paths: ./scripts/setup-tls.sh /path/to/cert.crt /path/to/cert.key"
    echo "2. Use cert-manager: kubectl apply -f deploy/cert-manager/"
    echo "3. Generate self-signed: ./scripts/setup-tls.sh --self-signed"
    exit 1
fi
