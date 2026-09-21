#!/usr/bin/env bash
# Dispara o deploy do siofi no Coolify (webhook).
# Uso: bash deploy.sh   (opcional: COOLIFY_TOKEN=<token da API> se o Coolify exigir autenticação)
set -euo pipefail

URL="https://painel.daksa.online/api/v1/deploy?uuid=bn4epoih0vabst7m7mxvfrnj&force=false"

if [ -n "${COOLIFY_TOKEN:-}" ]; then
  curl -fsS -H "Authorization: Bearer ${COOLIFY_TOKEN}" "$URL"
else
  curl -fsS "$URL"
fi
echo
