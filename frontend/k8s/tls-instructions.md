# Instructions for TLS setup:
#
# Option 1: Manual TLS secret (replace with your certificates)
# kubectl create secret tls jet-meal-tls \
#   --cert=/path/to/cert.crt \
#   --key=/path/to/cert.key \
#   -n frontend
#
# Option 2: Create from existing SSL dir (if exists at /home/student/ssl)
# kubectl create secret tls jet-meal-tls \
#   --cert=/home/student/ssl/fullchain.pem \
#   --key=/home/student/ssl/privkey.pem \
#   -n frontend
#
# Option 3: Use cert-manager (see cert-manager.yaml)
#
# Option 4: Let's Encrypt staging (for testing)
# kubectl apply -f - <<EOF
# apiVersion: cert-manager.io/v1
# kind: Issuer
# metadata:
#   name: letsencrypt-staging
#   namespace: frontend
# spec:
#   acme:
#     server: https://acme-staging-v02.api.letsencrypt.org/directory
#     email: your-email@example.com
#     privateKeySecretRef:
#       name: letsencrypt-staging
#     solvers:
#       - http01:
#           ingress:
#             class: nginx
# EOF
